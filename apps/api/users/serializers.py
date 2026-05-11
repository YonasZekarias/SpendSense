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
        if obj.role == 'vendor':
            vendor = obj.vendor_set.first()
            if vendor:
                return {
                    'vendor_id': vendor.id,
                    'shop_name': vendor.shop_name,
                    'city': vendor.city,
                    'address': vendor.address,
                    'contact_phone': vendor.contact_phone,
                    'is_verified': vendor.is_verified,
                    'rating_avg': str(vendor.rating_avg),
                    'rating_count': vendor.rating_count,
                    'latitude': str(vendor.latitude) if vendor.latitude else None,
                    'longitude': str(vendor.longitude) if vendor.longitude else None,
                    'image': vendor.image.url if vendor.image else None,
                }
        return None


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
