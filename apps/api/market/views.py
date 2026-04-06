from datetime import date, timedelta

from django.db.models import Avg, Count, Q
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Item, PriceSubmission
from .serializers import ItemSerializer, PriceSubmissionSerializer


class ItemsView(generics.ListAPIView):
    """GET /api/market/items/ — list tracked items (seeded via seed_items)."""

    permission_classes = [AllowAny]
    serializer_class = ItemSerializer
    queryset = Item.objects.all().order_by('name')

from .models import Forecast, Item, NationalPrice, PriceSubmission
from .serializers import (
    AdminSubmissionListSerializer,
    AdminSubmissionUpdateSerializer,
    ItemSerializer,
    PriceSubmissionSerializer,
)


class ItemListView(generics.ListAPIView):
    queryset = Item.objects.all().order_by('category', 'name')
    serializer_class = ItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        if category:
            qs = qs.filter(category__iexact=category)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(category__icontains=search))
        return qs


class ItemDetailView(generics.RetrieveAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [AllowAny]


class SubmitPriceView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PriceSubmissionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.validated_data.get('item')
        city = serializer.validated_data.get('city')
        price_value = serializer.validated_data.get('price_value')
        recent = PriceSubmission.objects.filter(
            item=item, city=city, status='approved',
        ).aggregate(avg=Avg('price_value'))
        avg = recent.get('avg')
        submission = serializer.save()
        if avg is not None:
            pct = abs(float(price_value - avg) / float(avg)) * 100
            if pct > 50:
                submission._outlier_warning = (
                    f'Price differs by {pct:.0f}% from recent average ({avg:.2f}).'
                )
        return Response(
            PriceSubmissionSerializer(submission, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class PriceAveragesView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('item_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
            openapi.Parameter('city', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('from_date', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('to_date', openapi.IN_QUERY, type=openapi.TYPE_STRING),
        ],
        responses={200: 'List of average price rows'},
    )
    def get(self, request):
        item_id = request.query_params.get('item_id')
        city = request.query_params.get('city')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        qs = PriceSubmission.objects.filter(status='approved')
        if item_id:
            qs = qs.filter(item_id=item_id)
        if city:
            qs = qs.filter(city__iexact=city)
        if from_date:
            qs = qs.filter(date_observed__gte=from_date)
        if to_date:
            qs = qs.filter(date_observed__lte=to_date)

        rows = (
            qs.values('item', 'item__name', 'city')
            .annotate(avg_price=Avg('price_value'), count=Count('id'))
            .order_by('item__name', 'city')
        )
        data = [
            {
                'item_id': r['item'],
                'item_name': r['item__name'],
                'average_price': str(round(r['avg_price'], 2)),
                'city': r['city'],
                'source': 'crowdsourced',
                'count': r['count'],
            }
            for r in rows
        ]
        return Response(data)


class AdminPendingSubmissionsView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = AdminSubmissionListSerializer

    def get_queryset(self):
        return (
            PriceSubmission.objects.filter(status='pending')
            .select_related('item', 'user')
            .order_by('created_at')
        )


class AdminSubmissionDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminRole]
    queryset = PriceSubmission.objects.select_related('item', 'user')
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return AdminSubmissionUpdateSerializer
        return AdminSubmissionListSerializer


class AdminSubmissionApproveView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            sub = PriceSubmission.objects.get(pk=pk)
        except PriceSubmission.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        sub.status = 'approved'
        sub.save(update_fields=['status'])
        return Response(AdminSubmissionListSerializer(sub).data)


class AdminSubmissionRejectView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            sub = PriceSubmission.objects.get(pk=pk)
        except PriceSubmission.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        sub.status = 'rejected'
        sub.save(update_fields=['status'])
        return Response(AdminSubmissionListSerializer(sub).data)


class PriceTrendsView(APIView):
    """Daily average from approved submissions (time series for charts)."""
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('item_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter('city', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('from_date', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('to_date', openapi.IN_QUERY, type=openapi.TYPE_STRING),
        ],
        responses={200: 'Series of {date, average_price, count}'},
    )
    def get(self, request):
        item_id = request.query_params.get('item_id')
        if not item_id:
            return Response({'detail': 'item_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        city = request.query_params.get('city')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        qs = PriceSubmission.objects.filter(status='approved', item_id=item_id)
        if city:
            qs = qs.filter(city__iexact=city)
        if from_date:
            qs = qs.filter(date_observed__gte=from_date)
        if to_date:
            qs = qs.filter(date_observed__lte=to_date)

        rows = (
            qs.values('date_observed')
            .annotate(avg_price=Avg('price_value'), count=Count('id'))
            .order_by('date_observed')
        )
        return Response([
            {
                'date': r['date_observed'].isoformat(),
                'average_price': str(round(r['avg_price'], 4)),
                'count': r['count'],
            }
            for r in rows
        ])


class PriceForecastsView(APIView):
    """Reads `Forecast` rows; if none, returns stub from last approved average."""
    permission_classes = [AllowAny]

    def get(self, request):
        item_id = request.query_params.get('item_id')
        if not item_id:
            return Response({'detail': 'item_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        city = request.query_params.get('city')
        weeks = int(request.query_params.get('forecast_weeks', '4'))

        qs = Forecast.objects.filter(item_id=item_id).order_by('forecast_date')
        if qs.exists():
            return Response([
                {
                    'item_id': int(item_id),
                    'forecast_date': f.forecast_date.isoformat(),
                    'predicted_price': str(f.predicted_price),
                    'confidence_low': str(f.confidence_low) if f.confidence_low is not None else None,
                    'confidence_high': str(f.confidence_high) if f.confidence_high is not None else None,
                    'model_used': f.model_used,
                    'city': city,
                }
                for f in qs[:weeks]
            ])

        # Stub: extend last known daily average flat for N weeks
        base_qs = PriceSubmission.objects.filter(status='approved', item_id=item_id)
        if city:
            base_qs = base_qs.filter(city__iexact=city)
        last = base_qs.order_by('-date_observed').first()
        if not last:
            return Response([])
        stub_price = last.price_value
        start = date.today()
        out = []
        for i in range(1, weeks + 1):
            fd = start + timedelta(weeks=i)
            out.append({
                'item_id': int(item_id),
                'forecast_date': fd.isoformat(),
                'predicted_price': str(stub_price),
                'confidence_low': None,
                'confidence_high': None,
                'model_used': 'stub_last_price',
                'city': city,
            })
        return Response(out)


class InflationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        period = request.query_params.get('period', 'month')
        city = request.query_params.get('city')
        item_id = request.query_params.get('item_id')

        end = date.today()
        if period == 'week':
            cur_start = end - timedelta(days=7)
            prev_start = end - timedelta(days=14)
            prev_end = end - timedelta(days=7)
        else:
            cur_start = end - timedelta(days=30)
            prev_start = end - timedelta(days=60)
            prev_end = end - timedelta(days=30)

        def _avg(start_d, end_d):
            qs = PriceSubmission.objects.filter(
                status='approved',
                date_observed__gte=start_d,
                date_observed__lte=end_d,
            )
            if city:
                qs = qs.filter(city__iexact=city)
            if item_id:
                qs = qs.filter(item_id=item_id)
            a = qs.aggregate(v=Avg('price_value'))
            return a['v']

        cur_avg = _avg(cur_start, end)
        prev_avg = _avg(prev_start, prev_end)
        change_pct = None
        if cur_avg and prev_avg and prev_avg > 0:
            change_pct = float((cur_avg - prev_avg) / prev_avg * 100)

        return Response({
            'period': period,
            'city': city,
            'item_id': int(item_id) if item_id else None,
            'current_avg': str(round(cur_avg, 4)) if cur_avg else None,
            'previous_avg': str(round(prev_avg, 4)) if prev_avg else None,
            'change_percent': round(change_pct, 2) if change_pct is not None else None,
        })


class NationalPriceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = NationalPrice.objects.select_related('item').all()
        item_id = request.query_params.get('item_id')
        city = request.query_params.get('city')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        if item_id:
            qs = qs.filter(item_id=item_id)
        if city:
            qs = qs.filter(city__iexact=city)
        if from_date:
            qs = qs.filter(date__gte=from_date)
        if to_date:
            qs = qs.filter(date__lte=to_date)
        qs = qs.order_by('-date')[:500]
        return Response([
            {
                'id': r.id,
                'item_id': r.item_id,
                'item_name': r.item.name,
                'price': str(r.price),
                'source': r.source,
                'city': r.city,
                'date': r.date.isoformat(),
            }
            for r in qs
        ])
