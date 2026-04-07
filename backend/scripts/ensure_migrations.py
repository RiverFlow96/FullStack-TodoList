"""Create missing migrations packages for apps that define models."""

from pathlib import Path

apps_dir = Path(__file__).resolve().parent.parent / "apps"

for app_dir in apps_dir.iterdir():
    if app_dir.joinpath("models.py").exists() and not app_dir.joinpath("migrations").exists():
        mig = app_dir / "migrations"
        mig.mkdir()
        (mig / "__init__.py").touch()
        print(f"Created {mig.relative_to(apps_dir.parent)}")
