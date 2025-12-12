from django.urls import path

from .api import WholesaleAccessSessionView, WholesaleAccessVerifyView, WholesaleCatalogView, WholesaleRequestView

urlpatterns = [
    path("wholesale/request/", WholesaleRequestView.as_view(), name="wholesale-request"),
    path("wholesale/access/verify/", WholesaleAccessVerifyView.as_view(), name="wholesale-access-verify"),
    path("wholesale/access/session/", WholesaleAccessSessionView.as_view(), name="wholesale-access-session"),
    path("wholesale/catalog/", WholesaleCatalogView.as_view(), name="wholesale-catalog"),
]
