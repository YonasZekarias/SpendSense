from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.http import Http404
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from .models import Vendor
from .vendor_serializers import VendorSerializer

class VendorRequestView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = VendorSerializer

    def perform_create(self, serializer):
        vendor = serializer.save()
        user = self.request.user
        if user.role != 'vendor':
            user.role = 'vendor'
            user.save(update_fields=['role'])

@method_decorator(name='put', decorator=swagger_auto_schema(
    operation_description="Update vendor profile completely. Supports file uploads for image and theme_image.",
    consumes=['multipart/form-data'],
))
@method_decorator(name='patch', decorator=swagger_auto_schema(
    operation_description="Update vendor profile partially. Supports file uploads for image and theme_image.",
    consumes=['multipart/form-data'],
))
class VendorUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = VendorSerializer

    def get_object(self):
        user = self.request.user
        if getattr(self, 'swagger_fake_view', False) or not user.is_authenticated:
            return Vendor()
        
        # 1. Try to get existing vendor first
        vendor = Vendor.objects.filter(owner=user).first()
        if vendor:
            # Ensure the user has the 'vendor' role if they have a vendor record
            if user.role == 'user':
                user.role = 'vendor'
                user.save(update_fields=['role'])
            return vendor
            
        # 2. If not found, create a default record. 
        # This prevents 404 errors and supports automatic vendor onboarding.
        vendor, created = Vendor.objects.get_or_create(
            owner=user,
            defaults={
                'shop_name': user.full_name or "My Business",
                'city': user.city or "Addis Ababa",
                'contact_phone': user.phone or ""
            }
        )
        
        # Ensure user role is updated
        if user.role == 'user':
            user.role = 'vendor'
            user.save(update_fields=['role'])
            
        return vendor
