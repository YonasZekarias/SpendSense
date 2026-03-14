import uuid

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("user", "User"),
        ("vendor", "Vendor"),
        ("admin", "Admin"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")
    city = models.CharField(max_length=120, null=True, blank=True)
    household_size = models.PositiveIntegerField(null=True, blank=True)
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    onboarding_completed = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    def __str__(self):
        return self.email


class Vendor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey("users.User", on_delete=models.CASCADE)
    shop_name = models.CharField(max_length=150)
    city = models.CharField(max_length=120)
    latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    type = models.CharField(max_length=50)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)