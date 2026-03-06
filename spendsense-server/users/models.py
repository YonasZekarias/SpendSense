from django.db import models
import uuid

class User(models.Model): 
    ROLE_CHOICES = ( 
        ('user', 'User'),
        ('vendor', 'Vendor'), 
        ('admin', 'Admin'), 
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    password_hash = models.TextField()
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    city = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Vendor(models.Model): 
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) 
    owner = models.ForeignKey(User, on_delete=models.CASCADE) 
    shop_name = models.CharField(max_length=150)
    city = models.CharField(max_length=120) 
    latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True) 
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True) 
    joined_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model): 
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    type = models.CharField(max_length=50) 
    message = models.TextField() 
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)