# Author: @DMsuDev

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
	PYTHON      := python -m
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
		PYTHON      := python3 -m
		EXE_EXT     :=
		FIXPATH      = $1
		RM_FILE      = rm -f $1
		RM_DIR       = rm -rf $1
		_rm_file     = rm -f $(1)
		_rm_dir      = rm -rf $(1)
		_find_tool   = $(shell command -v $(1) 2>/dev/null)

	else ifeq ($(UNAME_S),Darwin)
		DETECTED_OS := Linux
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

ifeq ($(DETECTED_OS),Windows)
    BACKEND_SCRIPT = backend/scripts/build_backend.ps1
	ENV_SCRIPT   = scripts/setup_env.ps1
	# Activate backend venv and run command in one line (PowerShell)
	run_in_venv = pwsh -NoProfile -Command "Set-Location backend; & .\.venv\Scripts\Activate.ps1; $(1)"
else
    BACKEND_SCRIPT = backend/scripts/build_backend.sh
	ENV_SCRIPT   = scripts/setup_env.sh
	# Activate backend venv and run command in one line (Bash)
	run_in_venv = cd backend && source .venv/bin/activate && $(1)
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
	@pwsh -NoProfile -Command "if (Test-Path 'backend\.venv') { Set-Location backend; & .\.venv\Scripts\Activate.ps1; & .\scripts\build_backend.ps1 } else { Write-Host 'ERROR: Virtual environment not found. Run make build-venv first'; exit 1 }"
else
	@if [ -d "backend/.venv" ]; then cd backend && source .venv/bin/activate && bash scripts/build_backend.sh; else $(call _fail,Virtual environment not found. Run 'make build-venv' first.); fi
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
	@$(call run_in_venv,python manage.py makemigrations; python manage.py migrate)
	$(call _ok,Migrations complete)
	$(call _done)

shell:
	$(call _section,Django Shell)
	@$(call run_in_venv,python manage.py shell)

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
	@$(call run_in_venv,ruff format .; ruff check --fix .)
	$(call _ok,Formatting complete)
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

.PHONY: clean-all clean-backend clean-pycache clean-venv

clean-all: clean-backend clean-pycache clean-venv

clean-backend:
	$(call _section,Clean Backend)
	@$(call _rm_dir,$(call FIXPATH,*.egg-info))
	@$(call _rm_dir,$(call FIXPATH,build))
	@$(call _rm_dir,$(call FIXPATH,dist))
	$(call _ok,Backend clean done)
	$(call _done)

clean-pycache:
	$(call _section,Clean Python cache)
	@$(call _rm_dir,$(call FIXPATH,**/__pycache__))
	@$(call _rm_dir,$(call FIXPATH,.mypy_cache))
	@$(call _rm_dir,$(call FIXPATH,.ruff_cache))
	@$(call _rm_dir,$(call FIXPATH,.pytest_cache))
	@$(call _rm_dir,$(call FIXPATH,backend/**/__pycache__))
	$(call _ok,Python cache cleaned)
	$(call _done)

clean-venv:
	$(call _section,Clean virtual environment)
	@$(call _rm_dir,$(call FIXPATH,backend/.venv))
	$(call _ok,Virtual environment removed)
	$(call _done)

# =========================================================================
# HELP
# =========================================================================

.PHONY: help

help:
	@printf "\n$(TITLE)$(PROJECT_NAME)$(RST) $(DIM)v$(PROJECT_VER)$(RST)\n"
	@printf "$(LINE)────────────────────────────────────────────$(RST)\n"
	@printf "\n$(BLD)Setup:$(RST)\n"
	@printf "  $(CYN)build-venv$(RST)    Crear entorno virtual e instalar deps\n"
	@printf "\n$(BLD)Development:$(RST)\n"
	@printf "  $(CYN)runserver$(RST)     Iniciar servidor de desarrollo Django\n"
	@printf "  $(CYN)migrate$(RST)       Crear y aplicar migraciones\n"
	@printf "  $(CYN)shell$(RST)         Abrir Django shell\n"
	@printf "  $(CYN)test$(RST)          Ejecutar tests con pytest\n"
	@printf "  $(CYN)lint$(RST)          Verificar código con Ruff\n"
	@printf "  $(CYN)format$(RST)        Formatear código con Ruff\n"
	@printf "\n$(BLD)Pre commits:$(RST)\n"
	@printf "  $(CYN)hooks-install$(RST) Instalar hooks de pre-commit\n"
	@printf "  $(CYN)hooks-run$(RST)     Ejecutar hooks de pre-commit\n"
	@printf "\n$(BLD)Actions:$(RST)\n"
	@printf "  $(CYN)act-ci$(RST)        Ejecutar CI Build localmente con Act\n"
	@printf "  $(CYN)act-codeql$(RST)    Ejecutar CodeQL Analysis localmente con Act\n"
	@printf "\n$(BLD)Clean:$(RST)\n"
	@printf "  $(CYN)clean-all$(RST)     Limpiar todo (backend + cache + venv)\n"
	@printf "  $(CYN)clean-backend$(RST) Limpiar archivos de build del backend\n"
	@printf "  $(CYN)clean-pycache$(RST) Limpiar cache de Python\n"
	@printf "  $(CYN)clean-venv$(RST)    Eliminar entorno virtual\n"
	@printf "\n"
