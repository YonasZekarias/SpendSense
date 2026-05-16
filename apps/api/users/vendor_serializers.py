from rest_framework import serializers
from .models import Vendor

class VendorSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    
    class Meta:
        model = Vendor
        fields = (
            'id', 'owner', 'owner_name', 'shop_name', 'city', 'address', 'contact_phone',
            'is_verified', 'verification_status', 'business_license', 'tin_number', 'rating_avg', 'rating_count', 'latitude', 'longitude',
            'image', 'theme_image', 'joined_at'
        )
        read_only_fields = ('id', 'owner', 'is_verified', 'rating_avg', 'rating_count', 'joined_at', 'verification_status')

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Automatically set to pending if verification documents are provided
        # and current status is not already verified or pending
        if ('business_license' in validated_data or 'tin_number' in validated_data):
            if instance.verification_status not in ['verified', 'pending']:
                # Note: We need to check if the incoming data + existing data 
                # covers both required fields if we want to be strict,
                # but for now, any update to these fields suggests a resubmission.
                validated_data['verification_status'] = 'pending'
        
        return super().update(instance, validated_data)

class VendorLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ('id', 'shop_name', 'latitude', 'longitude')
