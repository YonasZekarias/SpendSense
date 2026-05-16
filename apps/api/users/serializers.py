from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Notification, User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Accept 'email' in request body instead of 'username' for login."""

    def validate(self, attrs):
        email = attrs.get('email') or attrs.get('username')
        if email:
            attrs['username'] = email
        return super().validate(attrs)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=False)

    class Meta:
        model = User
        fields = (
            'id', 'full_name', 'email', 'phone', 'password',
            'role', 'city', 'household_size', 'income_bracket',
            'notification_preferences', 'onboarding_completed',
        )
        extra_kwargs = {
            'phone': {'required': False},
            'city': {'required': False},
            'household_size': {'required': False},
            'income_bracket': {'required': False},
            'notification_preferences': {'required': False},
            'onboarding_completed': {'required': False},
            'role': {'default': 'user'},
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = (validated_data.get('role') or 'user').lower()
        if role not in ('user', 'vendor'):
            role = 'user'
        validated_data['role'] = role
        user = User.objects.create_user(**validated_data, password=password)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    vendor_info = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'full_name', 'email', 'phone', 'role',
            'city', 'household_size', 'income_bracket', 'onboarding_completed', 'created_at',
            'avatar', 'vendor_info',
        )
        read_only_fields = ('id', 'email', 'role', 'created_at')

    def get_vendor_info(self, obj):
        from .vendor_serializers import VendorSerializer
        vendor = obj.vendor_set.first()
        if vendor:
            return VendorSerializer(vendor).data
        return None

    def update(self, instance, validated_data):
        # Support updating vendor fields directly via this serializer for convenience
        from .models import Vendor
        from .vendor_serializers import VendorSerializer
        
        # Extract vendor fields from initial_data (since they might not be in validated_data)
        vendor_fields = ['shop_name', 'address', 'contact_phone', 'image', 'theme_image', 'business_license', 'tin_number']
        vendor_data = {}
        for field in vendor_fields:
            if field in self.initial_data:
                vendor_data[field] = self.initial_data[field]
        
        # Also check for nested vendor_info
        nested_vendor_info = self.initial_data.get('vendor_info')
        if isinstance(nested_vendor_info, dict):
            vendor_data.update(nested_vendor_info)

        if vendor_data:
            vendor, _ = Vendor.objects.get_or_create(owner=instance)
            vendor_serializer = VendorSerializer(vendor, data=vendor_data, partial=True)
            if vendor_serializer.is_valid():
                vendor_serializer.save()
        
        return super().update(instance, validated_data)


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Aligned with task doc: GET/PATCH /api/users/preferences/."""

    class Meta:
        model = User
        fields = ('notification_preferences', 'onboarding_completed')
        extra_kwargs = {'onboarding_completed': {'required': False}}


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
class AdminUserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'email', 'full_name', 'phone', 'role', 'is_active', 'created_at',
        )
        read_only_fields = fields


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('is_active',)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'type', 'message', 'is_read', 'created_at')
        read_only_fields = ('id', 'type', 'message', 'created_at')
