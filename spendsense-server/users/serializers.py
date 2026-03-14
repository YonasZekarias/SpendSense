from decimal import Decimal

from django.contrib.auth import authenticate
from rest_framework import serializers

from users.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "role",
            "city",
            "household_size",
            "monthly_income",
            "onboarding_completed",
            "created_at",
        ]


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    remember_me = serializers.BooleanField(write_only=True, default=False)

    class Meta:
        model = User
        fields = ["full_name", "email", "phone", "password", "remember_me"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        validated_data.pop("remember_me", None)
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    remember_me = serializers.BooleanField(default=False)

    def validate(self, attrs):
        email = attrs.get("email", "").lower()
        password = attrs.get("password")
        user = authenticate(request=self.context.get("request"), email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        attrs["user"] = user
        attrs["email"] = email
        return attrs


class OnboardingSerializer(serializers.ModelSerializer):
    city = serializers.CharField(max_length=120)
    household_size = serializers.IntegerField(min_value=1, max_value=50)
    monthly_income = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0"))

    class Meta:
        model = User
        fields = ["city", "household_size", "monthly_income"]

    def update(self, instance, validated_data):
        instance.city = validated_data["city"]
        instance.household_size = validated_data["household_size"]
        instance.monthly_income = validated_data["monthly_income"]
        instance.onboarding_completed = True
        instance.save(update_fields=["city", "household_size", "monthly_income", "onboarding_completed", "updated_at"])
        return instance
