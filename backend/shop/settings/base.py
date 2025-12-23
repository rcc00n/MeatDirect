import os
import urllib.parse
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from backend/.env so S3 credentials are present
# regardless of how Django is started (manage.py, gunicorn, or other entrypoints).
load_dotenv(BASE_DIR / ".env")

def _get_env_bool(name: str, default: bool = False) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "y", "on"}


def _get_env_optional(name: str) -> str | None:
    raw = os.environ.get(name)
    if raw is None:
        return None
    value = raw.strip()
    return value or None

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key")
DEBUG = _get_env_bool("DJANGO_DEBUG", default=True)

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "").split(",") if os.environ.get("DJANGO_ALLOWED_HOSTS") else []

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "anymail",
    "corsheaders",
    "rest_framework",
    "products",
    "orders",
    "payments",
    "notifications",
    "contacts",
    "blog",
    "wholesale",
    "square_sync",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "shop.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "shop.wsgi.application"

# Prefer DATABASE_URL (Postgres on Dokku) and fall back to sqlite for local dev.
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    parsed = urllib.parse.urlparse(DATABASE_URL)
    if parsed.scheme not in ("postgres", "postgresql"):
        raise ValueError("Unsupported database scheme in DATABASE_URL")

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": parsed.path.lstrip("/"),
            "USER": parsed.username,
            "PASSWORD": parsed.password,
            "HOST": parsed.hostname,
            "PORT": parsed.port or 5432,
        }
    }
else:
    db_path = os.environ.get("DJANGO_DB_PATH")
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": db_path if db_path else BASE_DIR / "db.sqlite3",
        }
    }

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],
}

EMAIL_BACKEND = os.environ.get("EMAIL_BACKEND", "anymail.backends.sendgrid.EmailBackend")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "hello@meatdirect.com")
ANYMAIL = {
    "SENDGRID_API_KEY": os.environ.get("SENDGRID_API_KEY", ""),
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "static"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Django 4.2+/5.0 uses STORAGES; set both STORAGES and DEFAULT_FILE_STORAGE for compatibility.
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    }
}

# AWS / media storage
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_STORAGE_BUCKET_NAME")
AWS_S3_REGION_NAME = os.environ.get("AWS_S3_REGION_NAME", "ca-central-1")
AWS_MEDIA_LOCATION = os.environ.get("AWS_MEDIA_LOCATION", "media")

if AWS_STORAGE_BUCKET_NAME:
    INSTALLED_APPS.append("storages")
    AWS_S3_CUSTOM_DOMAIN = os.environ.get(
        "AWS_S3_CUSTOM_DOMAIN",
        f"{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com",
    )
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
    STORAGES["default"] = {"BACKEND": DEFAULT_FILE_STORAGE}
    MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/{AWS_MEDIA_LOCATION}/"
else:
    DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
    STORAGES["default"] = {"BACKEND": DEFAULT_FILE_STORAGE}
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"

def _split_env_list(name: str) -> list[str]:
    raw = (os.environ.get(name) or "").strip()
    if not raw:
        return []
    return [item for item in raw.replace(",", " ").split() if item]


CORS_ALLOWED_ORIGINS = _split_env_list("DJANGO_CORS_ALLOWED_ORIGINS")
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = _split_env_list("DJANGO_CSRF_TRUSTED_ORIGINS")

# Allow overriding cookie settings for cross-site frontend/backend setups.
DEFAULT_COOKIE_DOMAIN = _get_env_optional("DJANGO_COOKIE_DOMAIN")
CSRF_COOKIE_DOMAIN = _get_env_optional("DJANGO_CSRF_COOKIE_DOMAIN") or DEFAULT_COOKIE_DOMAIN
SESSION_COOKIE_DOMAIN = _get_env_optional("DJANGO_SESSION_COOKIE_DOMAIN") or DEFAULT_COOKIE_DOMAIN
CSRF_COOKIE_SAMESITE = os.environ.get("DJANGO_CSRF_COOKIE_SAMESITE", "Lax")
CSRF_COOKIE_SECURE = _get_env_bool("DJANGO_CSRF_COOKIE_SECURE", default=False)
SESSION_COOKIE_SAMESITE = os.environ.get("DJANGO_SESSION_COOKIE_SAMESITE", "Lax")
SESSION_COOKIE_SECURE = _get_env_bool("DJANGO_SESSION_COOKIE_SECURE", default=False)

SQUARE_ACCESS_TOKEN = os.environ.get("SQUARE_ACCESS_TOKEN", "")
SQUARE_ENVIRONMENT = os.environ.get("SQUARE_ENVIRONMENT", "sandbox")
SQUARE_API_VERSION = os.environ.get("SQUARE_API_VERSION", "2025-10-16")

if SQUARE_ENVIRONMENT == "sandbox":
    SQUARE_BASE_URL = "https://connect.squareupsandbox.com/v2"
else:
    SQUARE_BASE_URL = "https://connect.squareup.com/v2"

SQUARE_LOCATION_ID = os.environ.get("SQUARE_LOCATION_ID", "")

WHOLESALE_ACCESS_COOKIE_NAME = "wholesale_access"
WHOLESALE_ACCESS_TOKEN_DAYS = int(os.environ.get("WHOLESALE_ACCESS_TOKEN_DAYS", "14"))

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
