from django.urls import path

from .api import ContactMessageView, QuoteRequestView

urlpatterns = [
    path("contact/quote/", QuoteRequestView.as_view(), name="contact-quote"),
    path("contact/message/", ContactMessageView.as_view(), name="contact-message"),
]
