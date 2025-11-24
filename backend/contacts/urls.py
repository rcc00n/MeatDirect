from django.urls import path

from .api import QuoteRequestView

urlpatterns = [
    path("contact/quote/", QuoteRequestView.as_view(), name="contact-quote"),
]
