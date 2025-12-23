from django.urls import path
from rest_framework.routers import DefaultRouter

from .api import ProductViewSet, StorefrontSettingsView

router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")

urlpatterns = [
    path("storefront/", StorefrontSettingsView.as_view(), name="storefront-settings"),
]
urlpatterns += router.urls
