from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from users.models import Vendor
from users.vendor_serializers import VendorSerializer, VendorLocationSerializer

class VendorListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Vendor.objects.filter(is_verified=True)
    serializer_class = VendorSerializer
    search_fields = ('shop_name', 'city')
    filterset_fields = ('city', 'is_verified')

class VendorLocationListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Vendor.objects.filter(is_verified=True, latitude__isnull=False, longitude__isnull=False)
    serializer_class = VendorLocationSerializer
    pagination_class = None

from .models import VendorPrice
from .serializers import VendorPriceSerializer

class ItemVendorPricesView(generics.ListAPIView):
    """GET /api/market/vendors/prices/?item_id=X — list prices from vendors for a specific item."""
    permission_classes = [AllowAny]
    serializer_class = VendorPriceSerializer

    def get_queryset(self):
        item_id = self.request.query_params.get("item_id")
        if not item_id:
            return VendorPrice.objects.none()
        return VendorPrice.objects.filter(item_id=item_id).select_related('vendor').order_by('price')
