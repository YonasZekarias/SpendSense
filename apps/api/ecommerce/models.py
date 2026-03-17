from django.db import models
import uuid

class Transaction(models.Model): 
    STATUS_CHOICES = (
        ('pending', 'Pending'), 
        ('success', 'Success'), 
        ('failed', 'Failed') 
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='ETB')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    reference = models.CharField(max_length=120, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)