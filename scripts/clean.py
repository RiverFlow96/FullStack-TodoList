"""
clean.py — Project cleanup utility.

Removes build artifacts, caches, and temporary files from the workspace.

Usage:
    python scripts/clean.py [--dry-run] [--verbose] [targets...]

Targets (default: all):
    pycache     __pycache__ directories and .pyc / .pyo files
    build       build/, dist/, *.egg-info directories
    test        .pytest_cache/, .coverage, coverage.xml, htmlcov/
    type        .mypy_cache/, .ruff_cache/
    logs        *.log files inside logs/ directories
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

# =============================================
# Configuration
# =============================================

ROOT = Path(__file__).resolve().parent.parent

# Directories to remove (matched by name anywhere under ROOT)
DIR_PATTERNS: dict[str, list[str]] = {
    "pycache": ["__pycache__"],
    "build":   ["build", "dist"],
    "test":    [".pytest_cache", "htmlcov"],
    "type":    [".mypy_cache", ".ruff_cache"],
    "logs":    ["logs"],
}

# Glob patterns for files to remove (relative to ROOT)
FILE_PATTERNS: dict[str, list[str]] = {
    "pycache": ["**/*.pyc", "**/*.pyo"],
    "build":   ["**/*.egg-info"],
    "test":    [".coverage", "coverage.xml", "**/.coverage"],
    "type":    [],
    "logs":    ["**/*.log"],
}

ALL_TARGETS = list(DIR_PATTERNS.keys())

# Directories to never descend into or remove
EXCLUDE_DIRS: set[str] = {".venv", "node_modules", ".git"}

# =============================================
# Helpers
# =============================================

WIDTH = 52


def _header(title: str) -> None:
    print(f"\n{'-' * WIDTH}")
    print(f"  {title}")
    print(f"{'-' * WIDTH}")


def _row(label: str, value: str, status: str = "") -> None:
    pad = WIDTH - len(label) - len(status) - 4
    print(f"  {label:<{pad}} {status}")


def _removed(path: Path, dry: bool) -> None:
    tag = "[dry-run]" if dry else "[removed]"
    rel = path.relative_to(ROOT)
    print(f"    {tag}  {rel}")


def _is_excluded(path: Path) -> bool:
    """Return True if path falls inside an excluded directory."""
    try:
        parts = path.relative_to(ROOT).parts
    except ValueError:
        return False
    return bool(EXCLUDE_DIRS.intersection(parts))


def _summary(removed: int, skipped: int, dry: bool) -> None:
    label = "Would remove" if dry else "Removed"
    print(f"\n  {label}  : {removed} item(s)")
    if skipped:
        print(f"  Skipped  : {skipped} item(s)  (permission error)")
    print(f"{'-' * WIDTH}\n")


# =============================================
# Core logic
# =============================================

def _remove(path: Path, dry: bool, verbose: bool) -> tuple[int, int]:
    """Remove a single file or directory. Returns (removed, skipped)."""
    if not path.exists():
        return 0, 0
    try:
        if verbose or dry:
            _removed(path, dry)
        if not dry:
            if path.is_dir():
                shutil.rmtree(path)
            else:
                path.unlink()
        return 1, 0
    except PermissionError:
        print(f"    [skip]   {path.relative_to(ROOT)}  (permission denied)")
        return 0, 1


def clean(targets: list[str], dry: bool = False, verbose: bool = False, extensions: list[str] | None = None) -> int:
    removed = skipped = 0

    _header(f"Clean  {'(dry-run)' if dry else ''}")

    for target in targets:
        print(f"\n  Target: {target}")

        # Directories matched by name
        for name in DIR_PATTERNS.get(target, []):
            for path in sorted(ROOT.rglob(name)):
                if path.is_dir() and not _is_excluded(path):
                    r, s = _remove(path, dry, verbose)
                    removed += r
                    skipped += s

        # File glob patterns
        for pattern in FILE_PATTERNS.get(target, []):
            for path in sorted(ROOT.rglob(pattern)):
                if path.is_file() and not _is_excluded(path):
                    r, s = _remove(path, dry, verbose)
                    removed += r
                    skipped += s

    # Extra extensions passed via --ext
    if extensions:
        print(f"\n  Target: ext ({', '.join(extensions)})")
        for ext in extensions:
            ext = ext if ext.startswith(".") else f".{ext}"
            for path in sorted(ROOT.rglob(f"**/*{ext}")):
                if path.is_file() and not _is_excluded(path):
                    r, s = _remove(path, dry, verbose)
                    removed += r
                    skipped += s

    _summary(removed, skipped, dry)
    return 0 if skipped == 0 else 1


# =============================================
# CLI
# =============================================

def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Remove build artifacts and caches from the project.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"Available targets: {', '.join(ALL_TARGETS)}",
    )
    parser.add_argument(
        "targets",
        nargs="*",
        default=ALL_TARGETS,
        choices=ALL_TARGETS + [[]],  # allow empty (default)
        help="Targets to clean (default: all)",
    )
    parser.add_argument(
        "--ext",
        nargs="+",
        metavar="EXT",
        help="Extra file extensions to remove (e.g. --ext .pyc .log)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be deleted without removing anything",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print every removed path",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    sys.exit(clean(args.targets, dry=args.dry_run, verbose=args.verbose, extensions=args.ext))
