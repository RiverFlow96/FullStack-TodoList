import json
import os
import socket
import urllib.error
import urllib.parse
import urllib.request


class AIServiceError(Exception):
    pass


class ProviderNotConfiguredError(AIServiceError):
    pass


class ProviderTimeoutError(AIServiceError):
    pass


class ProviderQuotaError(AIServiceError):
    pass


class ProviderAuthError(AIServiceError):
    pass


class BaseLLMProvider:
    def suggest_task(self, prompt, existing_tasks):
        raise NotImplementedError


def _env_str(name, default=""):
    return os.getenv(name, default).strip()


def _timeout_seconds():
    try:
        return int(os.getenv("LLM_TIMEOUT_SECONDS", "20"))
    except (TypeError, ValueError):
        return 20


def _build_prompt(prompt, existing_tasks):
    context = {
        "existingTasks": [
            {
                "title": (task.get("title") or "")[:200],
                "description": (task.get("description") or "")[:1000],
                "completed": bool(task.get("completed", False)),
            }
            for task in (existing_tasks or [])[:50]
        ]
    }

    return (
        "Eres un asistente para planificar tareas. Devuelve UNICAMENTE un JSON valido "
        "sin markdown ni texto extra con esta forma exacta: "
        '{"title":"string","description":"string"'
        '"subtasks":["string"]}. '
        "Debes responder en espanol simple y util para el usuario. "
        "Si faltan datos, haz una mejor suposicion razonable. "
        f"Prompt del usuario: {prompt}\n"
        f"Contexto existente: {json.dumps(context, ensure_ascii=False)}"
    )


def _http_json_request(url, payload, headers):
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(url, data=body, headers=headers, method="POST")
    timeout = _timeout_seconds()

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw)
    except urllib.error.HTTPError as exc:
        response_body = exc.read().decode("utf-8", errors="ignore")
        if exc.code == 429:
            raise ProviderQuotaError("Provider quota exceeded") from exc
        if exc.code in (401, 403):
            raise ProviderAuthError(
                "Provider authentication/authorization failed"
            ) from exc
        if exc.code >= 500:
            raise AIServiceError("Provider server error") from exc
        raise AIServiceError(f"Provider request failed: {response_body[:500]}") from exc
    except urllib.error.URLError as exc:
        raise ProviderTimeoutError("Provider request timed out") from exc
    except socket.timeout as exc:
        raise ProviderTimeoutError("Provider request timed out") from exc


def _parse_json_content(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise AIServiceError("Provider returned non-JSON content")
        fragment = text[start : end + 1]
        try:
            return json.loads(fragment)
        except json.JSONDecodeError as exc:
            raise AIServiceError("Provider returned malformed JSON") from exc


def _normalize_response(data):
    if not isinstance(data, dict):
        raise AIServiceError("Invalid AI response type")

    title = str(data.get("title", "")).strip()
    if not title:
        raise AIServiceError("AI response missing title")

    description = str(data.get("description", "")).strip()
    priority = str(data.get("priority", "medium")).strip().lower()
    if priority not in {"low", "medium", "high"}:
        priority = "medium"

    subtasks = data.get("subtasks", [])
    if not isinstance(subtasks, list):
        subtasks = []
    subtasks = [str(item).strip() for item in subtasks if str(item).strip()]

    tags = data.get("tags", [])
    if not isinstance(tags, list):
        tags = []
    tags = [str(item).strip().lower() for item in tags if str(item).strip()]

    return {
        "title": title[:200],
        "description": description[:4000],
        "priority": priority,
        "subtasks": subtasks[:10],
        "tags": tags[:10],
    }


class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        self.api_key = _env_str("OPENAI_API_KEY")
        self.model = _env_str("OPENAI_MODEL", "gpt-4o-mini")
        if not self.api_key:
            raise ProviderNotConfiguredError("OPENAI_API_KEY is not configured")

    def suggest_task(self, prompt, existing_tasks):
        url = "https://api.openai.com/v1/chat/completions"
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "Responde siempre en JSON valido con la estructura solicitada.",
                },
                {"role": "user", "content": _build_prompt(prompt, existing_tasks)},
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"},
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        response = _http_json_request(url, payload, headers)
        content = response["choices"][0]["message"]["content"]
        parsed = _parse_json_content(content)
        return _normalize_response(parsed)


class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        self.api_key = _env_str("GEMINI_API_KEY")
        self.model = _env_str("GEMINI_MODEL", "gemini-1.5-flash")
        if not self.api_key:
            raise ProviderNotConfiguredError("GEMINI_API_KEY is not configured")

    def suggest_task(self, prompt, existing_tasks):
        encoded_model = urllib.parse.quote(self.model, safe="")
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{encoded_model}"
            f":generateContent?key={self.api_key}"
        )
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": "Responde siempre en JSON valido con la estructura solicitada."
                        },
                        {"text": _build_prompt(prompt, existing_tasks)},
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "responseMimeType": "application/json",
            },
        }
        headers = {"Content-Type": "application/json"}
        response = _http_json_request(url, payload, headers)
        content = response["candidates"][0]["content"]["parts"][0]["text"]
        parsed = _parse_json_content(content)
        return _normalize_response(parsed)


class AzureOpenAIProvider(BaseLLMProvider):
    def __init__(self):
        self.api_key = _env_str("AZURE_OPENAI_API_KEY")
        self.endpoint = _env_str("AZURE_OPENAI_ENDPOINT")
        self.deployment = _env_str("AZURE_OPENAI_DEPLOYMENT")
        self.api_version = _env_str("AZURE_OPENAI_API_VERSION")

        if not all([self.api_key, self.endpoint, self.deployment, self.api_version]):
            raise ProviderNotConfiguredError(
                "Azure OpenAI env vars are not fully configured"
            )

    def suggest_task(self, prompt, existing_tasks):
        base_endpoint = self.endpoint.rstrip("/")
        url = (
            f"{base_endpoint}/openai/deployments/{self.deployment}/chat/completions"
            f"?api-version={self.api_version}"
        )
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": "Responde siempre en JSON valido con la estructura solicitada.",
                },
                {"role": "user", "content": _build_prompt(prompt, existing_tasks)},
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"},
        }
        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json",
        }
        response = _http_json_request(url, payload, headers)
        content = response["choices"][0]["message"]["content"]
        parsed = _parse_json_content(content)
        return _normalize_response(parsed)


def _get_provider(provider_name):
    normalized = (provider_name or "").strip().lower()
    if normalized == "openai":
        return OpenAIProvider()
    if normalized == "gemini":
        return GeminiProvider()
    if normalized == "azure":
        return AzureOpenAIProvider()
    raise ProviderNotConfiguredError("LLM_PROVIDER must be openai, gemini, or azure")


def suggest_task(prompt, existing_tasks=None):
    provider_name = os.getenv("LLM_PROVIDER", "").strip().lower()
    if not provider_name:
        raise ProviderNotConfiguredError("LLM_PROVIDER is not configured")

    provider = _get_provider(provider_name)
    return provider.suggest_task(prompt=prompt, existing_tasks=existing_tasks or [])
