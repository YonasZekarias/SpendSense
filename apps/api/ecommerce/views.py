import math
from decimal import Decimal

from django.conf import settings
from django.db.models import Avg
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core_api.permissions import IsAdminRole
from market.models import VendorPrice
from users.models import AuditLog, Notification, User, Vendor

from .models import Transaction, VendorReview
from .serializers import (
    PurchaseCreateSerializer,
    PurchaseStatusUpdateSerializer,
    TransactionSerializer,
    VendorPriceSerializer,
    VendorPublicSerializer,
    VendorRegisterSerializer,
    VendorReviewSerializer,
)


def _haversine_km(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return None
    r = 6371.0
    p1, p2 = math.radians(float(lat1)), math.radians(float(lat2))
    dp = math.radians(float(lat2) - float(lat1))
    dl = math.radians(float(lon2) - float(lon1))
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * r * math.asin(math.sqrt(a)), 2)


class VendorRegisterView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VendorRegisterSerializer


class VendorDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Vendor.objects.all()
    serializer_class = VendorPublicSerializer
    lookup_field = 'pk'


class VendorListingListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VendorPriceSerializer

    def get_vendor(self):
        vendor = get_object_or_404(Vendor, pk=self.kwargs['vendor_id'])
        is_admin = IsAdminRole().has_permission(self.request, self)
        if vendor.owner_id != self.request.user.id and not is_admin:
            self.permission_denied(self.request)
        return vendor

    def get_queryset(self):
        v = self.get_vendor()
        return VendorPrice.objects.filter(vendor=v).select_related('item', 'vendor').order_by('-date', '-id')

    def perform_create(self, serializer):
        v = self.get_vendor()
        serializer.save(vendor=v)


class VendorListingUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VendorPriceSerializer
    http_method_names = ['patch', 'head', 'options']

    def get_queryset(self):
        qs = VendorPrice.objects.select_related('vendor')
        user = self.request.user
        if IsAdminRole().has_permission(self.request, self):
            return qs
        return qs.filter(vendor__owner=user)


class RecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        item_id = request.query_params.get('item_id')
        if not item_id:
            return Response({'detail': 'item_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        city = request.query_params.get('city')
        lat = request.query_params.get('latitude')
        lon = request.query_params.get('longitude')
        limit = int(request.query_params.get('limit', '20'))

        vps = VendorPrice.objects.filter(
            item_id=item_id,
            vendor__is_verified=True,
        ).select_related('vendor', 'item').order_by('vendor_id', '-date', '-id')

        if city:
            vps = vps.filter(vendor__city__iexact=city)

        seen = set()
        rows = []
        for vp in vps:
            if vp.vendor_id in seen:
                continue
            seen.add(vp.vendor_id)
            rows.append(vp)

        from market.models import PriceSubmission
        avg_rec = PriceSubmission.objects.filter(
            status='approved', item_id=item_id,
        )
        if city:
            avg_rec = avg_rec.filter(city__iexact=city)
        market_avg = avg_rec.aggregate(a=Avg('price_value'))['a']

        out = []
        user_lat = float(lat) if lat else None
        user_lon = float(lon) if lon else None
        for vp in rows:
            v = vp.vendor
            dist = None
            if user_lat is not None and user_lon is not None and v.latitude and v.longitude:
                dist = _haversine_km(user_lat, user_lon, v.latitude, v.longitude)
            vs_market = None
            if market_avg and market_avg > 0:
                vs_market = float((vp.price - market_avg) / market_avg * 100)
            out.append({
                'vendor_id': str(v.id),
                'shop_name': v.shop_name,
                'city': v.city,
                'rating_avg': str(v.rating_avg),
                'rating_count': v.rating_count,
                'listing_id': vp.id,
                'price': str(vp.price),
                'item_id': vp.item_id,
                'item_name': vp.item.name,
                'unit': vp.item.unit,
                'distance_km': dist,
                'percent_vs_market_avg': round(vs_market, 2) if vs_market is not None else None,
            })
        out.sort(key=lambda x: (Decimal(x['price']), x['distance_km'] or 1e9))
        return Response(out[:limit])


class PurchaseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PurchaseCreateSerializer
        return TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).select_related('vendor').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        ser = PurchaseCreateSerializer(data=request.data, context={'request': request})
        ser.is_valid(raise_exception=True)
        tx = ser.save()
        return Response(TransactionSerializer(tx).data, status=status.HTTP_201_CREATED)


class PurchaseDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class PurchaseStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        tx = get_object_or_404(Transaction, pk=pk)
        is_admin = IsAdminRole().has_permission(request, self)
        if tx.vendor.owner_id != request.user.id and not is_admin:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PurchaseStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']
        tx.status = new_status
        tx.save(update_fields=['status', 'updated_at'])
        Notification.objects.create(
            user=tx.user,
            type='delivery_update',
            message=f'Order {tx.reference} status changed to {new_status}.',
        )
        AuditLog.objects.create(
            actor=request.user,
            action='purchase_status_update',
            resource='transaction',
            resource_id=str(tx.id),
            detail={'status': new_status},
        )
        return Response(TransactionSerializer(tx).data)


class PaymentWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        secret = request.headers.get('X-WEBHOOK-SECRET', '')
        expected = getattr(settings, 'PAYMENT_WEBHOOK_SECRET', '')
        if expected and secret != expected:
            return Response({'detail': 'Invalid webhook signature.'}, status=status.HTTP_403_FORBIDDEN)
        reference = request.data.get('reference')
        result = str(request.data.get('status', '')).lower()
        gateway_ref = request.data.get('gateway_reference', '')
        if not reference:
            return Response({'detail': 'reference is required.'}, status=status.HTTP_400_BAD_REQUEST)
        tx = get_object_or_404(Transaction, reference=reference)
        if result in ('success', 'paid'):
            tx.status = 'paid'
            tx.paid_at = timezone.now()
        elif result in ('failed', 'cancelled'):
            tx.status = result
        tx.payment_reference = gateway_ref or tx.payment_reference
        tx.webhook_payload = request.data
        tx.save(update_fields=['status', 'paid_at', 'payment_reference', 'webhook_payload', 'updated_at'])
        Notification.objects.create(
            user=tx.user,
            type='payment_confirmation',
            message=f'Payment update for order {tx.reference}: {tx.status}.',
        )
        AuditLog.objects.create(
            actor=None,
            action='payment_webhook',
            resource='transaction',
            resource_id=str(tx.id),
            detail={'status': tx.status, 'reference': reference},
        )
        return Response({'detail': 'Webhook processed.', 'status': tx.status}, status=status.HTTP_200_OK)


class VendorReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = VendorReviewSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_vendor(self):
        return get_object_or_404(Vendor, pk=self.kwargs['vendor_id'])

    def get_queryset(self):
        return VendorReview.objects.filter(vendor_id=self.kwargs['vendor_id']).select_related('user')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['vendor'] = self.get_vendor()
        return ctx

    def perform_create(self, serializer):
        serializer.save()


class AdminVendorListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = VendorPublicSerializer

    def get_queryset(self):
        return Vendor.objects.select_related('owner').order_by('-joined_at')


class AdminVendorVerifyView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        v = get_object_or_404(Vendor, pk=pk)
        v.is_verified = True
        v.save(update_fields=['is_verified'])
        AuditLog.objects.create(
            actor=request.user,
            action='vendor_verify',
            resource='vendor',
            resource_id=str(v.id),
        )
        return Response(VendorPublicSerializer(v).data)


class AdminVendorRejectView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        v = get_object_or_404(Vendor, pk=pk)
        if Transaction.objects.filter(vendor=v).exists():
            return Response(
                {'detail': 'Cannot remove vendor with existing purchases.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        owner_id = v.owner_id
        v.delete()
        User.objects.filter(pk=owner_id).update(role='user')
        AuditLog.objects.create(
            actor=request.user,
            action='vendor_reject',
            resource='vendor',
            resource_id=str(pk),
        )
        return Response({'detail': 'Vendor rejected and profile removed.'}, status=status.HTTP_200_OK)
