from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Accept 'email' in request body instead of 'username' for login."""

    def validate(self, attrs):
        email = attrs.get('email') or attrs.get('username')
        if email:
            attrs['username'] = email
        return super().validate(attrs)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            'id', 'full_name', 'email', 'phone', 'password',
            'role', 'city', 'household_size', 'income_bracket',
        )
        extra_kwargs = {
            'phone': {'required': False},
            'city': {'required': False},
            'household_size': {'required': False},
            'income_bracket': {'required': False},
            'role': {'default': 'user', 'read_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'full_name', 'email', 'phone', 'role',
            'city', 'household_size', 'income_bracket', 'created_at',
        )
        read_only_fields = ('id', 'email', 'role', 'created_at')
