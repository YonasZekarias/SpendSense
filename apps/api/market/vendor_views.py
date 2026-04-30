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
