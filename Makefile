# Author:  @DMsuDev
# Project: TODO: Change name lol
# License: MIT

.DEFAULT_GOAL := help
.SUFFIXES:

# =========================================================================
# Project
# =========================================================================

PROJECT_NAME  := ToDo List App
PROJECT_VER   := 1.0.0

# =========================================================================
# Platform
# =========================================================================

ifeq ($(OS),Windows_NT)
	DETECTED_OS := Windows
	PYTHON      := python
	NPM         := npm.cmd
	EXE_EXT     := .exe
	FIXPATH      = $(subst /,\,$1)
	_rm_file     = powershell -NoProfile -Command "Remove-Item -Force -ErrorAction SilentlyContinue -Path '$(1)'; exit 0"
	_rm_dir      = powershell -NoProfile -Command "Remove-Item -Recurse -Force -ErrorAction SilentlyContinue -Path '$(1)'; exit 0"
	_find_tool   = $(shell pwsh -NoProfile -Command "(Get-Command $(1) -ErrorAction SilentlyContinue).Source")
else
	# Use uname to detect non-Windows systems
	UNAME_S := $(shell uname -s)

	ifeq ($(UNAME_S),Linux)
		DETECTED_OS := Linux
		PYTHON      := python3
		NPM         := npm
		EXE_EXT     :=
		FIXPATH      = $1
		RM_FILE      = rm -f $1
		RM_DIR       = rm -rf $1
		_rm_file     = rm -f $(1)
		_rm_dir      = rm -rf $(1)
		_find_tool   = $(shell command -v $(1) 2>/dev/null)

	else ifeq ($(UNAME_S),Darwin)
		DETECTED_OS := Darwin
		PYTHON      := python3 -m
		EXE_EXT     :=
		FIXPATH      = $1
		RM_FILE      = rm -f $1
		RM_DIR       = rm -rf $1
		_rm_file     = rm -f $(1)
		_rm_dir      = rm -rf $(1)
		_find_tool   = $(shell command -v $(1) 2>/dev/null)

	else
		$(error Unsupported operating system: $(UNAME_S))
	endif
endif

# Default Django settings module (override with: make <target> DJANGO_ENV=production)
DJANGO_ENV ?= development
DJANGO_SETTINGS_MODULE ?= config.settings.$(DJANGO_ENV)

ifeq ($(DETECTED_OS),Windows)
    BACKEND_SCRIPT = backend/scripts/build_backend.ps1
	ENV_SCRIPT   = scripts/setup_env.ps1
	# Activate backend venv and run command in one line (PowerShell)
	run_in_venv = pwsh -NoProfile -Command "Set-Location backend; & .\.venv\Scripts\Activate.ps1; [Environment]::SetEnvironmentVariable('DJANGO_SETTINGS_MODULE', '$(DJANGO_SETTINGS_MODULE)', 'Process'); $(1)"
else
    BACKEND_SCRIPT = backend/scripts/build_backend.sh
	ENV_SCRIPT   = scripts/setup_env.sh
	# Activate backend venv and run command in one line (POSIX sh compatible)
	run_in_venv = . .venv/bin/activate && cd backend && DJANGO_SETTINGS_MODULE=$(DJANGO_SETTINGS_MODULE) $(1)
endif

# =========================================================================
# Verbose (0 = silent . 1 = colored detail)
# =========================================================================
# Automatically silenced when make is invoked with -s or -j flags.

VERBOSE ?= 1

# Optional: if the user passes -s (--silent), force VERBOSE=0
ifneq ($(findstring -s,$(MAKEFLAGS)),)
	VERBOSE := 0
else ifneq ($(filter -j%,$(MAKEFLAGS)),)
	VERBOSE := 0
endif

# =========================================================================
# Colors
# =========================================================================

ifeq ($(VERBOSE),1)
	RST   := \033[0m
	BLD   := \033[1m
	DIM   := \033[2m
	GRN   := \033[0;32m
	YLW   := \033[0;33m
	BLU   := \033[0;34m
	CYN   := \033[0;36m
	# Semantic
	LINE  := \033[1;30m
	TITLE := \033[1;35m
	INFO  := \033[0;34m
	OK    := \033[0;32m
	WARN  := \033[0;33m
	ERR   := \033[0;31m
	HL    := \033[1;36m
else
	RST   :=
	BLD   :=
	DIM   :=
	GRN   :=
	YLW   :=
	BLU   :=
	CYN   :=
	LINE  :=
	TITLE :=
	INFO  :=
	OK    :=
	WARN  :=
	ERR   :=
	HL    :=
endif

# =========================================================================
# Display helpers
# =========================================================================
#
#   $(call _banner,SECTION)   project-info header (build / configure / tidy)
#   $(call _section,TITLE)    lightweight section divider
#   $(call _ok,MSG)           success   [OK]
#   $(call _fail,MSG)         error     [ERR]  (exits with code 1)
#   $(call _warn,MSG)         warning   [!]
#   $(call _done)             closing rule
#   $(call _require,VAR,name,install-hint)

define _banner
@printf "\n$(LINE)─── $(TITLE)$(1): $(RST)$(BLD)$(PROJECT_NAME)$(RST) $(DIM)v$(PROJECT_VER)$(RST)\n"
@printf "  $(BLD)> Platform:$(RST)   $(DETECTED_OS)\n"
@printf "$(LINE)────────────────────────────────────────────$(RST)\n"
endef

_section = @printf "\n$(LINE)───────$(RST) $(TITLE)$(1)$(RST)\n"
_ok      = @printf "  $(OK)[OK]$(RST) %s\n" "$(1)"
_fail    = @printf "  $(ERR)[ERR] Error: $(1)$(RST)\n" && exit 1
_warn    = @printf "  $(WARN)[!] $(1)$(RST)\n"
_done    = @printf "$(LINE)────────────────────────────────────────────$(RST)\n"

_require = $(if $($(1)),,$(call _fail,$(2) is not installed. Install: $(3)))

# =========================================================================
# Tool detection (evaluated once)
# =========================================================================

HAS_ACT := $(call _find_tool,act)

# =========================================================================
# VIRTUAL ENVIRONMENT
# =========================================================================

.PHONY: build-venv

build-venv:
	$(call _section,Setup Environment)
ifeq ($(DETECTED_OS),Windows)
	@pwsh -NoProfile -ExecutionPolicy Bypass -Command "& $(ENV_SCRIPT)"
else
	@bash $(ENV_SCRIPT)
endif
	$(call _ok,Environment setup complete)
	$(call _done)

# =========================================================================
# BUILD SCRIPTS
# =========================================================================

.PHONY: build-backend

build-backend:
	$(call _banner,Build Backend)
ifeq ($(DETECTED_OS),Windows)
	@pwsh -NoProfile -Command "if (Test-Path '.venv') { Set-Location backend; & ..\.venv\Scripts\Activate.ps1; & .\scripts\build_backend.ps1 } else { Write-Host 'ERROR: Virtual environment not found. Run make build-venv first'; exit 1 }"
else
	@if [ -d ".venv" ]; then source .venv/bin/activate && cd backend && bash scripts/build_backend.sh; else $(call _fail,Virtual environment not found. Run 'make build-venv' first.); fi
endif
	$(call _ok,Backend build complete)
	$(call _done)


# =========================================================================
# DEVELOPMENT
# =========================================================================

.PHONY: runserver migrate shell test lint format

runserver:
	$(call _section,Starting Django Development Server)
	@$(call run_in_venv,python manage.py runserver)

migrate:
	$(call _section,Running Migrations)
	@$(call run_in_venv,python scripts/ensure_migrations.py && python manage.py makemigrations && python manage.py migrate)
	$(call _ok,Migrations complete)
	$(call _done)

shell:
	$(call _section,Django Shell)
	$(call run_in_venv,python manage.py shell)

test:
	$(call _section,Running Tests)
	@$(call run_in_venv,pytest)
	$(call _ok,Tests complete)
	$(call _done)

lint:
	$(call _section,Linting with Ruff)
	@$(call run_in_venv,ruff check .)
	$(call _ok,Linting complete)
	$(call _done)

format:
	$(call _section,Formatting with Ruff)
	@$(call run_in_venv,ruff format . && ruff check --fix .)
	$(call _ok,Formatting complete)
	$(call _done)

# =========================================================================
# FRONTEND
# =========================================================================

.PHONY: frontend-install frontend-dev frontend-build frontend-lint

frontend-install:
	$(call _section,Installing Frontend Dependencies)
	cd frontend && $(NPM) install
	$(call _ok,Frontend dependencies installed)
	$(call _done)

frontend-dev:
	$(call _section,Starting Frontend Dev Server)
	cd frontend && $(NPM) run dev

frontend-build:
	$(call _section,Building Frontend)
	cd frontend && $(NPM) run build
	$(call _ok,Frontend build complete)
	$(call _done)

frontend-lint:
	$(call _section,Linting Frontend)
	cd frontend && $(NPM) run lint
	$(call _ok,Frontend lint complete)
	$(call _done)

# =========================================================================
# ACTION SCRIPTS
# =========================================================================

.PHONY: act-ci act-codeql

act-ci:
	$(call _require,HAS_ACT,act,choco install act-cli | winget install nektos.act | brew install act)
	$(call _section,Running CI Build)
	@act push -W ./.github/workflows/ci.yml --container-architecture linux/amd64
	$(call _ok,CI build complete)
	$(call _done)

act-codeql:
	$(call _require,HAS_ACT,act,choco install act-cli | winget install nektos.act | brew install act)
	$(call _section,Running CodeQL Analysis)
	@act push -W ./.github/workflows/codeql.yml --container-architecture linux/amd64
	$(call _ok,CodeQL analysis complete)
	$(call _done)

# =========================================================================
# PRE COMMIT
# =========================================================================

.PHONY: hooks-install hooks-run

hooks-install:
	$(call _section,Installing pre-commit hooks)
	@$(call run_in_venv,pre-commit install)
	$(call _ok,Pre-commit hooks installed)
	$(call _done)

hooks-run:
	$(call _section,Running pre-commit hooks)
	$(call run_in_venv,pre-commit run --all-files)
	$(call _ok,Pre-commit hooks run complete)
	$(call _done)


# =========================================================================
# CLEAN
# =========================================================================

.PHONY: clean-cache clean-build clean-db clean-venv clean-frontend clean-all

# Remove __pycache__, *.pyc, mypy/ruff/pytest caches and coverage reports
clean-cache:
	$(call _section,Clean Cache & Temp Files)
	@python scripts/clean.py pycache type test logs
	$(call _ok,Cache cleaned)
	$(call _done)

# Remove build/, dist/, *.egg-info (packaging artifacts)
clean-build:
	$(call _section,Clean Build Artifacts)
	@python scripts/clean.py build
	$(call _ok,Build artifacts cleaned)
	$(call _done)

# Remove the SQLite database generated by migrate (dev only)
clean-db:
	$(call _section,Clean Django Database)
	@$(call _rm_file,$(call FIXPATH,backend/db.sqlite3))
	$(call _ok,Database removed)
	$(call _done)

clean-venv:
	$(call _section,Clean Virtual Environment)
	@$(call _rm_dir,$(call FIXPATH,.venv))
	$(call _ok,Virtual environment removed)
	$(call _done)

## Remove frontend node_modules and dist
clean-frontend:
	$(call _section,Clean Frontend)
	@$(call _rm_dir,$(call FIXPATH,frontend/node_modules))
	@$(call _rm_dir,$(call FIXPATH,frontend/dist))
	$(call _ok,Frontend cleaned)
	$(call _done)

## Full clean: cache + build + db + venv + frontend
clean-all: clean-cache clean-build clean-db clean-venv clean-frontend
	$(call _section,Clean All)
	$(call _ok,Full clean done)
	$(call _done)

# =========================================================================
# HELP
# =========================================================================

.PHONY: help

help:
	@printf "\n$(TITLE)$(PROJECT_NAME)$(RST) $(DIM)v$(PROJECT_VER)$(RST)"
	@printf "  $(DIM)— by @DMsuDev$(RST)\n"
	@printf "$(LINE)────────────────────────────────────────────$(RST)\n"
	@printf "\n$(BLD)Setup:$(RST)\n"
	@printf "  $(CYN)build-venv$(RST)       Create virtual environment and install deps\n"
	@printf "\n$(BLD)Backend:$(RST)\n"
	@printf "  $(CYN)runserver$(RST)        Start Django development server\n"
	@printf "  $(CYN)migrate$(RST)          Create and apply database migrations\n"
	@printf "  $(CYN)shell$(RST)            Open Django shell\n"
	@printf "  $(CYN)test$(RST)             Run tests with pytest\n"
	@printf "  $(CYN)lint$(RST)             Lint code with Ruff\n"
	@printf "  $(CYN)format$(RST)           Format code with Ruff\n"
	@printf "\n$(BLD)Frontend:$(RST)\n"
	@printf "  $(CYN)frontend-install$(RST) Install npm dependencies\n"
	@printf "  $(CYN)frontend-dev$(RST)     Start Vite dev server\n"
	@printf "  $(CYN)frontend-build$(RST)   Build for production\n"
	@printf "  $(CYN)frontend-lint$(RST)    Lint with ESLint\n"
	@printf "\n$(BLD)Pre-commit:$(RST)\n"
	@printf "  $(CYN)hooks-install$(RST)    Install pre-commit hooks\n"
	@printf "  $(CYN)hooks-run$(RST)        Run pre-commit hooks on all files\n"
	@printf "\n$(BLD)Actions:$(RST)\n"
	@printf "  $(CYN)act-ci$(RST)           Run CI build locally with Act\n"
	@printf "  $(CYN)act-codeql$(RST)       Run CodeQL analysis locally with Act\n"
	@printf "\n$(BLD)Clean:$(RST)\n"
	@printf "  $(CYN)clean-cache$(RST)      Remove __pycache__, .pyc, tool caches and coverage\n"
	@printf "  $(CYN)clean-build$(RST)      Remove packaging artifacts (build/, dist/, *.egg-info)\n"
	@printf "  $(CYN)clean-db$(RST)         Remove SQLite database (dev only)\n"
	@printf "  $(CYN)clean-venv$(RST)       Remove virtual environment\n"
	@printf "  $(CYN)clean-frontend$(RST)   Remove node_modules and dist\n"
	@printf "  $(CYN)clean-all$(RST)        Full clean (cache + build + db + venv + frontend)\n"
	@printf "\n"
