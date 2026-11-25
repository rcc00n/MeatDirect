"""Isolated test settings: no live storage, email, database or provider credentials."""
import os
import tempfile
from pathlib import Path

os.environ.update(PYTHON_DOTENV_DISABLED='1', DATABASE_URL='', DJANGO_SECRET_KEY='isolated-tests-only-not-for-production', DJANGO_DEBUG='false', AWS_EC2_METADATA_DISABLED='true')
for name in ('AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_STORAGE_BUCKET_NAME', 'STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET', 'SQUARE_ACCESS_TOKEN', 'SENDGRID_API_KEY'):
    os.environ.pop(name, None)

from .base import *  # noqa: E402,F403

DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
DEFAULT_FROM_EMAIL = 'no-reply@example.test'
ALLOWED_HOSTS = ['testserver', 'localhost', '127.0.0.1']
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
_TEST_STORAGE = tempfile.TemporaryDirectory(prefix='meatdirect-tests-')
MEDIA_ROOT = Path(_TEST_STORAGE.name)
STORAGES = {'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'}, 'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}}
