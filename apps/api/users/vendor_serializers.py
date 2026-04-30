from rest_framework import serializers
from .models import Vendor

class VendorSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    
    class Meta:
        model = Vendor
        fields = (
            'id', 'owner', 'owner_name', 'shop_name', 'city', 'address', 'contact_phone',
            'is_verified', 'rating_avg', 'rating_count', 'latitude', 'longitude',
            'image', 'joined_at'
        )
        read_only_fields = ('id', 'owner', 'is_verified', 'rating_avg', 'rating_count', 'joined_at')

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

class VendorLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ('id', 'shop_name', 'latitude', 'longitude')
