import uuid
from decimal import Decimal

from django.db import transaction
from django.db.models import Avg
from django.conf import settings
from rest_framework import serializers

from market.models import VendorPrice
from users.models import User, Vendor

from .chapa import ChapaInitError, initialize_chapa_checkout
from .models import Transaction, VendorReview


class VendorPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = (
            'id', 'shop_name', 'city', 'address', 'contact_phone',
            'latitude', 'longitude', 'is_verified', 'rating_avg', 'rating_count', 'joined_at',
        )


class VendorRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ('shop_name', 'city', 'address', 'contact_phone', 'latitude', 'longitude')

    def validate(self, attrs):
        user = self.context['request'].user
        if Vendor.objects.filter(owner=user).exists():
            raise serializers.ValidationError('A vendor profile already exists for this account.')
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        with transaction.atomic():
            vendor = Vendor.objects.create(owner=user, **validated_data)
            User.objects.filter(pk=user.pk).update(role='vendor')
        return vendor


class VendorPriceSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    unit = serializers.CharField(source='item.unit', read_only=True)

    class Meta:
        model = VendorPrice
        fields = ('id', 'item', 'item_name', 'unit', 'price', 'date', 'is_verified')
        read_only_fields = ('id', 'date')


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = (
            'id', 'vendor', 'vendor_price', 'quantity', 'amount', 'currency',
            'status', 'reference', 'payment_method', 'payment_reference',
            'payment_url', 'paid_at', 'created_at', 'updated_at',
        )
        read_only_fields = fields


class PurchaseCreateSerializer(serializers.Serializer):
    vendor_id = serializers.UUIDField()
    listing_id = serializers.IntegerField(help_text='VendorPrice id')
    quantity = serializers.IntegerField(min_value=1, default=1)
    delivery_address = serializers.CharField(required=False, allow_blank=True, default='')
    payment_method = serializers.ChoiceField(
        choices=['chapa', 'telebirr', 'cash'],
        required=False,
        default='chapa',
    )

    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        vendor_id = validated_data['vendor_id']
        listing_id = validated_data['listing_id']
        qty = validated_data['quantity']

        try:
            vp = VendorPrice.objects.select_related('vendor').get(pk=listing_id, vendor_id=vendor_id)
        except VendorPrice.DoesNotExist:
            raise serializers.ValidationError('Invalid vendor_id or listing_id.')

        if not vp.vendor.is_verified:
            raise serializers.ValidationError('Vendor is not verified yet.')

        amount = (vp.price * Decimal(str(qty))).quantize(Decimal('0.01'))
        ref = uuid.uuid4().hex

        payment_method = validated_data.get('payment_method') or 'chapa'
        rec = Transaction.objects.create(
            user=user,
            vendor=vp.vendor,
            vendor_price=vp,
            quantity=qty,
            amount=amount,
            status='pending',
            reference=ref,
            payment_method=payment_method,
            payment_url='',
        )
        if payment_method == 'chapa':
            try:
                full_name = (user.full_name or 'SpendSense User').split()
                first_name = full_name[0]
                last_name = ' '.join(full_name[1:]) if len(full_name) > 1 else 'User'
                rec.payment_url = initialize_chapa_checkout(
                    tx_ref=rec.reference,
                    amount=rec.amount,
                    email=user.email,
                    first_name=first_name,
                    last_name=last_name,
                )
            except ChapaInitError as exc:
                raise serializers.ValidationError({'payment': str(exc)})
        else:
            rec.payment_url = (
                f"{settings.FRONTEND_URL.rstrip('/')}/shop/payment/return?reference={rec.reference}"
            )
        rec.save(update_fields=['payment_url'])
        return rec


class PurchaseStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['shipped', 'delivered', 'cancelled'])


class VendorReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = VendorReview
        fields = ('id', 'vendor', 'user', 'user_email', 'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'vendor', 'user', 'user_email', 'created_at')

    def validate_rating(self, v):
        if v < 1 or v > 5:
            raise serializers.ValidationError('Rating must be 1–5.')
        return v

    def create(self, validated_data):
        request = self.context['request']
        vendor = self.context['vendor']
        if VendorReview.objects.filter(vendor=vendor, user=request.user).exists():
            raise serializers.ValidationError('You already reviewed this vendor.')
        review = VendorReview.objects.create(vendor=vendor, user=request.user, **validated_data)
        agg = VendorReview.objects.filter(vendor=vendor).aggregate(avg=Avg('rating'))
        count = VendorReview.objects.filter(vendor=vendor).count()
        Vendor.objects.filter(pk=vendor.pk).update(
            rating_avg=Decimal(str(round(float(agg['avg'] or 0), 2))),
            rating_count=count,
        )
        return review
