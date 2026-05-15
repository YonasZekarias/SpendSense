from rest_framework import serializers

from .models import Item, PriceSubmission


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id', 'name', 'category', 'unit', 'description', 'image')


class AdminItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id', 'name', 'category', 'unit', 'description', 'image')
        read_only_fields = ('id',)

    def validate_name(self, value):
        normalized = value.strip()
        if Item.objects.filter(name__iexact=normalized).exists():
            raise serializers.ValidationError('An item with this name already exists.')
        return normalized

    def validate_category(self, value):
        return value.strip()

    def validate_unit(self, value):
        return value.strip()


class PriceSubmissionSerializer(serializers.ModelSerializer):
    item_id = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), source='item')
    outlier_warning = serializers.SerializerMethodField()

    class Meta:
        model = PriceSubmission
        fields = (
            'id', 'item_id', 'price_value', 'market_location', 'city',
            'date_observed', 'status', 'image', 'created_at', 'outlier_warning',
        )
        read_only_fields = ('id', 'status', 'created_at')

    def get_outlier_warning(self, obj):
        return getattr(obj, '_outlier_warning', None)

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AdminSubmissionListSerializer(serializers.ModelSerializer):
    """Admin queue: includes submitter identity."""
    item_name = serializers.CharField(source='item.name', read_only=True)
    submitter_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = PriceSubmission
        fields = (
            'id', 'item', 'item_name', 'price_value', 'market_location', 'city',
            'date_observed', 'status', 'image', 'created_at', 'submitter_email',
        )


class AdminSubmissionUpdateSerializer(serializers.ModelSerializer):
    """Admin may correct fields before approve."""
    item = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(), required=False,
    )

    class Meta:
        model = PriceSubmission
        fields = (
            'item', 'price_value', 'market_location', 'city', 'date_observed', 'status', 'image',
        )

from .models import VendorPrice

class VendorPriceSerializer(serializers.ModelSerializer):
    vendor_id = serializers.UUIDField(source='vendor.id', read_only=True)
    vendor_name = serializers.CharField(source='vendor.shop_name', read_only=True)
    city = serializers.CharField(source='vendor.city', read_only=True)
    rating_avg = serializers.DecimalField(source='vendor.rating_avg', max_digits=3, decimal_places=2, read_only=True)
    is_verified = serializers.BooleanField(source='vendor.is_verified', read_only=True)

    class Meta:
        model = VendorPrice
        fields = ('id', 'vendor_id', 'vendor_name', 'city', 'rating_avg', 'is_verified', 'price', 'date')
        ref_name = "MarketVendorPrice"

from users.models import Vendor

class MarketVendorListCardSerializer(serializers.ModelSerializer):
    vendorName = serializers.CharField(source='owner.full_name', read_only=True)
    shopName = serializers.CharField(source='shop_name', read_only=True)
    location = serializers.CharField(source='address', read_only=True)
    region = serializers.CharField(source='city', read_only=True)
    rating = serializers.FloatField(source='rating_avg', read_only=True)
    reviewCount = serializers.IntegerField(source='rating_count', read_only=True)
    verifiedStatus = serializers.SerializerMethodField()
    contactInfo = serializers.CharField(source='contact_phone', read_only=True)
    itemsListed = serializers.SerializerMethodField()
    priceRangeMin = serializers.SerializerMethodField()
    priceRangeMax = serializers.SerializerMethodField()
    imageUrl = serializers.SerializerMethodField()
    topItems = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='joined_at', read_only=True)
    competitivenessScore = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = (
            'id', 'vendorName', 'shopName', 'location', 'region',
            'latitude', 'longitude', 'rating', 'reviewCount', 'competitivenessScore',
            'verifiedStatus', 'contactInfo', 'itemsListed', 'priceRangeMin',
            'priceRangeMax', 'topItems', 'imageUrl', 'createdAt'
        )

    def get_verifiedStatus(self, obj):
        return "Verified" if obj.is_verified else "Unverified"

    def get_itemsListed(self, obj):
        return VendorPrice.objects.filter(vendor=obj).count()

    def get_priceRangeMin(self, obj):
        prices = VendorPrice.objects.filter(vendor=obj).values_list('price', flat=True)
        return float(min(prices)) if prices else 0.0

    def get_priceRangeMax(self, obj):
        prices = VendorPrice.objects.filter(vendor=obj).values_list('price', flat=True)
        return float(max(prices)) if prices else 0.0

    def get_topItems(self, obj):
        top_prices = VendorPrice.objects.filter(vendor=obj).select_related('item').order_by('price')[:3]
        return [
            {
                "itemName": vp.item.name,
                "price": float(vp.price),
                "unit": getattr(vp.item, 'unit', '')
            }
            for vp in top_prices
        ]

    def get_imageUrl(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def get_competitivenessScore(self, obj):
        return 95  # Static for now as requested


class VendorDetailSerializer(MarketVendorListCardSerializer):
    description = serializers.SerializerMethodField()
    businessHours = serializers.SerializerMethodField()
    deliveryAvailable = serializers.SerializerMethodField()
    deliveryEstimate = serializers.SerializerMethodField()
    paymentMethods = serializers.SerializerMethodField()
    totalSales = serializers.SerializerMethodField()
    memberSince = serializers.DateTimeField(source='joined_at', read_only=True)
    responseTimeMinutes = serializers.SerializerMethodField()
    socialLinks = serializers.SerializerMethodField()

    class Meta(MarketVendorListCardSerializer.Meta):
        fields = MarketVendorListCardSerializer.Meta.fields + (
            'description', 'businessHours', 'deliveryAvailable', 'deliveryEstimate',
            'paymentMethods', 'totalSales', 'memberSince', 'responseTimeMinutes', 'socialLinks'
        )

    def get_description(self, obj):
        return f"{obj.shop_name} is a trusted vendor in {obj.city}. We provide high-quality items with excellent customer service."

    def get_businessHours(self, obj):
        return "Mon - Sat: 8:00 AM - 6:00 PM"

    def get_deliveryAvailable(self, obj):
        return True

    def get_deliveryEstimate(self, obj):
        return "1 - 2 days"

    def get_paymentMethods(self, obj):
        return ["Chapa", "Cash on Delivery", "Telebirr"]

    def get_totalSales(self, obj):
        return getattr(obj, 'rating_count', 0) * 12 + 50

    def get_responseTimeMinutes(self, obj):
        return 15

    def get_socialLinks(self, obj):
        return {"facebook": "#", "telegram": "#"}


class VendorProductSerializer(serializers.ModelSerializer):
    itemId = serializers.CharField(source='item.id', read_only=True)
    itemName = serializers.CharField(source='item.name', read_only=True)
    category = serializers.CharField(source='item.category', read_only=True)
    imageUrl = serializers.SerializerMethodField()
    unit = serializers.CharField(source='item.unit', read_only=True)
    comparePrice = serializers.SerializerMethodField()
    stockStatus = serializers.SerializerMethodField()
    stockQuantity = serializers.SerializerMethodField()
    priceTrend = serializers.SerializerMethodField()
    nationalAveragePrice = serializers.SerializerMethodField()
    nationalAverageDiff = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='date', read_only=True)
    updatedAt = serializers.DateTimeField(source='date', read_only=True)

    class Meta:
        model = VendorPrice
        fields = (
            'id', 'itemId', 'itemName', 'category', 'imageUrl', 'price', 'unit',
            'comparePrice', 'stockStatus', 'stockQuantity', 'priceTrend',
            'nationalAveragePrice', 'nationalAverageDiff', 'createdAt', 'updatedAt'
        )

    def get_imageUrl(self, obj):
        if obj.item and obj.item.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.item.image.url) if request else obj.item.image.url
        return None

    def get_comparePrice(self, obj):
        return float(obj.price) * 1.15

    def get_stockStatus(self, obj):
        return "InStock"

    def get_stockQuantity(self, obj):
        return 50

    def get_priceTrend(self, obj):
        return -2.5

    def get_nationalAveragePrice(self, obj):
        return float(obj.price) * 1.05

    def get_nationalAverageDiff(self, obj):
        return -5.0


class VendorReviewSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    userName = serializers.CharField()
    userInitial = serializers.CharField()
    rating = serializers.IntegerField()
    comment = serializers.CharField()
    date = serializers.DateTimeField()
    helpfulCount = serializers.IntegerField()
    verifiedPurchase = serializers.BooleanField()
