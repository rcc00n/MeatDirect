# MeatDirect commerce application

A Django REST and React/TypeScript application for a product catalogue, cart, checkout, order processing and operational notifications. The source includes Stripe payment intent handling, Square inventory integration, PDF receipts and wholesale access workflows; it is beyond the original scaffolding stage.

## Review the engineering

- `backend/payments/`: checkout validation, payment records and authenticated Stripe webhooks.
- `backend/orders/`: order snapshots and state transitions.
- `backend/notifications/`: receipt/status email records and PDF generation.
- `backend/security/`: request and access boundaries.
- `frontend/`: Vite/React storefront and checkout interfaces.

The webhook always verifies the raw body with the endpoint signing secret. Missing configuration returns 503; absent/invalid signatures return 400 before any order, inventory or notification mutation. Offline regressions exercise genuine locally computed HMAC signatures and mocked downstream providers.

## Reproduce the checks

Use Python 3.12 and Node 22 in a new checkout:

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
python ci/check_backend.py
python backend/manage.py makemigrations --check --dry-run --settings=shop.settings.test
npm --prefix frontend ci
npm --prefix frontend run lint
npm --prefix frontend run build
```

The backend runner uses an in-memory SQLite database, temporary media, in-memory email and a socket guard. No live Stripe, Square, SendGrid, S3 or production database is required. CI runs the same backend suite and frontend checks; no deployment is triggered. Dependencies are pinned to the environment used for verification.

## Local development

Django's `manage.py` defaults to local settings. Create an isolated local database with `python backend/manage.py migrate`, a fresh administrator with `createsuperuser`, and run `python backend/manage.py runserver`. Start `npm --prefix frontend run dev` separately. Review the frontend API base/proxy settings and create synthetic catalogue records rather than importing customer data.

Provider-enabled development requires your own sandbox values. The backend reads environment settings and may load `backend/.env`; keep that file and all real secrets outside Git. Running sync/checkout/email commands with real credentials can cause real side effects and is not part of the offline review flow.

## Limits and ownership

This repository does not establish current hosting, production payment readiness, business metrics or rights to redistribute client-provided assets. Confirm ownership and use synthetic screenshots/records for public demonstrations. SQLite regressions do not prove PostgreSQL concurrency behavior. Product/payment/provider behavior requires separate sandbox and infrastructure verification before deployment. Preserve original Git attribution and third-party notices.
