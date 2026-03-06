from django.db import models

class Item(models.Model): 
    name = models.CharField(max_length=120, unique=True) 
    category = models.CharField(max_length=100) 
    unit = models.CharField(max_length=30)

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
    date = models.DateField(auto_now_add=True) 
    is_verified = models.BooleanField(default=False)

class Forecast(models.Model): 
    item = models.ForeignKey(Item, on_delete=models.CASCADE) 
    forecast_date = models.DateField()
    predicted_price = models.DecimalField(max_digits=12, decimal_places=2)
    model_used = models.CharField(max_length=50) 
    confidence_low = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True) 
    confidence_high = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True) 
    generated_at = models.DateTimeField(auto_now_add=True)