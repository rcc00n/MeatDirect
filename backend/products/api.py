from rest_framework import filters, permissions, response, views, viewsets

from .models import Product, StorefrontSettings
from .serializers import ProductSerializer, StorefrontSettingsSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "category"]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get("category")

        if category:
            queryset = queryset.filter(category__iexact=category)

        return queryset


class StorefrontSettingsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        settings = StorefrontSettings.objects.first()
        if not settings:
            settings = StorefrontSettings(large_cuts_category="")
        serializer = StorefrontSettingsSerializer(settings)
        return response.Response(serializer.data)
