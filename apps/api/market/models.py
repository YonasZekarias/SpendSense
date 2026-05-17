from django.db import models


class Item(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='items/', null=True, blank=True)
    category = models.CharField(max_length=100)
    unit = models.CharField(max_length=30)


class PriceSubmission(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    TIME_CHOICES = (
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
        ('evening', 'Evening'),
    )
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    price_value = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=30, blank=True, default='')
    market_location = models.CharField(max_length=120)
    city = models.CharField(max_length=120)
    vendor_name = models.CharField(max_length=120, blank=True, default='')
    date_observed = models.DateField()
    time_observed = models.CharField(max_length=20, choices=TIME_CHOICES, blank=True, default='')
    quality_grade = models.CharField(max_length=60, blank=True, default='')
    quantity_available = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True, default='')
    outlier_flag = models.BooleanField(default=False)
    image = models.ImageField(upload_to='submissions/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class NationalPrice(models.Model):
    SOURCE_CHOICES = (
        ('crowdsourced', 'Crowdsourced'),
        ('official', 'Official')
    )

    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    city = models.CharField(max_length=120)
    date = models.DateField()


class VendorPrice(models.Model):
    vendor = models.ForeignKey('users.Vendor', on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_count = models.PositiveIntegerField(default=0)
    date = models.DateField(auto_now_add=True)
    image = models.ImageField(upload_to='listings/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)


class VendorPriceImage(models.Model):
    vendor_price = models.ForeignKey(VendorPrice, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='listings/')
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('position', 'id')


class Forecast(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    forecast_date = models.DateField()
    predicted_price = models.DecimalField(max_digits=12, decimal_places=2)
    model_used = models.CharField(max_length=50)
    confidence_low = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    confidence_high = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)


class ForecastRun(models.Model):
    model_used = models.CharField(max_length=50, default='moving_average')
    status = models.CharField(max_length=20, default='success')
    item_count = models.PositiveIntegerField(default=0)
    detail = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
