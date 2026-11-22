"""Settings for isolated Playwright end-to-end runs."""

import os

from .development import *  # noqa: F403

DATABASES["default"]["NAME"] = os.environ["E2E_DATABASE_PATH"]  # noqa: F405
