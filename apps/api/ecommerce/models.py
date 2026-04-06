from django.db import models
import uuid


class Transaction(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
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
    payment_url = models.URLField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)


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
