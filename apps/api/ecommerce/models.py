from django.db import models
import uuid


class Transaction(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='purchases')
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE)
    vendor_price = models.ForeignKey(
        'market.VendorPrice',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions',
    )
    quantity = models.PositiveIntegerField(default=1)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='ETB')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    reference = models.CharField(max_length=120, unique=True)
    payment_method = models.CharField(max_length=30, default='chapa')
    payment_reference = models.CharField(max_length=120, blank=True, default='')
    payment_url = models.URLField(blank=True, default='')
    webhook_payload = models.JSONField(default=dict, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class VendorReview(models.Model):
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()  # 1–5
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=('vendor', 'user'),
                name='unique_vendor_review_per_user',
            ),
        ]
