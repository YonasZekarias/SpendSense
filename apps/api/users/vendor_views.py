from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Vendor
from .vendor_serializers import VendorSerializer

class VendorRequestView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VendorSerializer

    def perform_create(self, serializer):
        vendor = serializer.save()
        user = self.request.user
        if user.role != 'vendor':
            user.role = 'vendor'
            user.save(update_fields=['role'])
