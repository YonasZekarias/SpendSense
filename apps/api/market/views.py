from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Avg, Count, Q
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from users.models import AuditLog

from core_api.permissions import IsAdminRole
from .models import Forecast, ForecastRun, Item, NationalPrice, PriceSubmission
from .serializers import (
    AdminItemCreateSerializer,
    AdminSubmissionListSerializer,
    AdminSubmissionUpdateSerializer,
    ItemSerializer,
    MySubmissionSerializer,
    PriceSubmissionSerializer,
)


class ItemsListView(generics.ListAPIView):
    """GET /api/market/items/ — list tracked items; query: category, search."""

    permission_classes = [AllowAny]
    serializer_class = ItemSerializer

    def get_queryset(self):
        qs = Item.objects.all().order_by("category", "name")
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        if category:
            qs = qs.filter(category__iexact=category)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(category__icontains=search))
        return qs


class ItemDetailView(generics.RetrieveAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [AllowAny]


class AdminItemCreateView(generics.CreateAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = AdminItemCreateSerializer

    def perform_create(self, serializer):
        item = serializer.save()
        AuditLog.objects.create(
            actor=self.request.user,
            action="item_create",
            resource="item",
            resource_id=str(item.id),
            detail={"name": item.name, "category": item.category, "unit": item.unit},
        )


class SubmitPriceView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PriceSubmissionSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.validated_data.get("item")
        city = serializer.validated_data.get("city")
        price_value = serializer.validated_data.get("price_value")
        recent = PriceSubmission.objects.filter(
            item=item,
            city=city,
            status="approved",
        ).aggregate(avg=Avg("price_value"))
        avg = recent.get("avg")
        submission = serializer.save()
        if avg is not None:
            pct = abs(float(price_value - avg) / float(avg)) * 100
            if pct > 50:
                submission._outlier_warning = (
                    f"Price differs by {pct:.0f}% from recent average ({avg:.2f})."
                )
        return Response(
            PriceSubmissionSerializer(submission, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class PriceAveragesView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter("item_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
            openapi.Parameter("city", openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter("from_date", openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter("to_date", openapi.IN_QUERY, type=openapi.TYPE_STRING),
        ],
        responses={200: "List of average price rows"},
    )
    def get(self, request):
        item_id = request.query_params.get("item_id")
        city = request.query_params.get("city")
        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")

        qs = PriceSubmission.objects.filter(status="approved")
        if item_id:
            qs = qs.filter(item_id=item_id)
        if city:
            qs = qs.filter(city__iexact=city)
        if from_date:
            qs = qs.filter(date_observed__gte=from_date)
        if to_date:
            qs = qs.filter(date_observed__lte=to_date)

        rows = (
            qs.values("item", "item__name", "city")
            .annotate(avg_price=Avg("price_value"), count=Count("id"))
            .order_by("item__name", "city")
        )
        data = [
            {
                "item_id": r["item"],
                "item_name": r["item__name"],
                "average_price": str(round(r["avg_price"], 2)),
                "city": r["city"],
                "source": "crowdsourced",
                "count": r["count"],
            }
            for r in rows
        ]
        return Response(data)


class AdminPendingSubmissionsView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = AdminSubmissionListSerializer

    def get_queryset(self):
        return (
            PriceSubmission.objects.filter(status="pending")
            .select_related("item", "user")
            .order_by("created_at")
        )


class AdminSubmissionDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminRole]
    queryset = PriceSubmission.objects.select_related("item", "user")
    http_method_names = ["get", "patch", "head", "options"]

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return AdminSubmissionUpdateSerializer
        return AdminSubmissionListSerializer


class AdminSubmissionApproveView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            sub = PriceSubmission.objects.get(pk=pk)
        except PriceSubmission.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        sub.status = "approved"
        sub.save(update_fields=["status"])
        AuditLog.objects.create(
            actor=request.user,
            action="submission_approve",
            resource="price_submission",
            resource_id=str(sub.id),
        )
        return Response(AdminSubmissionListSerializer(sub).data)


class AdminSubmissionRejectView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            sub = PriceSubmission.objects.get(pk=pk)
        except PriceSubmission.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        sub.status = "rejected"
        sub.save(update_fields=["status"])
        AuditLog.objects.create(
            actor=request.user,
            action="submission_reject",
            resource="price_submission",
            resource_id=str(sub.id),
        )
        return Response(AdminSubmissionListSerializer(sub).data)


class PriceTrendsView(APIView):
    """Daily average from approved submissions (time series for charts)."""

    permission_classes = [AllowAny]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter("item_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter("city", openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter("from_date", openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter("to_date", openapi.IN_QUERY, type=openapi.TYPE_STRING),
        ],
        responses={200: "Series of {date, average_price, count}"},
    )
    def get(self, request):
        item_id = request.query_params.get("item_id")
        if not item_id:
            return Response({"detail": "item_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        city = request.query_params.get("city")
        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")

        qs = PriceSubmission.objects.filter(status="approved", item_id=item_id)
        if city:
            qs = qs.filter(city__iexact=city)
        if from_date:
            qs = qs.filter(date_observed__gte=from_date)
        if to_date:
            qs = qs.filter(date_observed__lte=to_date)

        rows = (
            qs.values("date_observed")
            .annotate(avg_price=Avg("price_value"), count=Count("id"))
            .order_by("date_observed")
        )
        return Response(
            [
                {
                    "date": r["date_observed"].isoformat(),
                    "average_price": str(round(r["avg_price"], 4)),
                    "count": r["count"],
                }
                for r in rows
            ]
        )


class PriceForecastsView(APIView):
    """Reads `Forecast` rows; if none, returns stub from last approved average."""

    permission_classes = [AllowAny]

    def get(self, request):
        item_id = request.query_params.get("item_id")
        if not item_id:
            return Response({"detail": "item_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        city = request.query_params.get("city")
        weeks = int(request.query_params.get("forecast_weeks", "4"))

        qs = Forecast.objects.filter(item_id=item_id).order_by("forecast_date")
        if qs.exists():
            return Response(
                [
                    {
                        "item_id": int(item_id),
                        "forecast_date": f.forecast_date.isoformat(),
                        "predicted_price": str(f.predicted_price),
                        "confidence_low": str(f.confidence_low) if f.confidence_low is not None else None,
                        "confidence_high": str(f.confidence_high) if f.confidence_high is not None else None,
                        "model_used": f.model_used,
                        "city": city,
                    }
                    for f in qs[:weeks]
                ]
            )

        base_qs = PriceSubmission.objects.filter(status="approved", item_id=item_id)
        if city:
            base_qs = base_qs.filter(city__iexact=city)
        last = base_qs.order_by("-date_observed").first()
        if not last:
            return Response([])
        stub_price = last.price_value
        start = date.today()
        out = []
        for i in range(1, weeks + 1):
            fd = start + timedelta(weeks=i)
            out.append(
                {
                    "item_id": int(item_id),
                    "forecast_date": fd.isoformat(),
                    "predicted_price": str(stub_price),
                    "confidence_low": None,
                    "confidence_high": None,
                    "model_used": "stub_last_price",
                    "city": city,
                }
            )
        return Response(out)


class InflationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        period = request.query_params.get("period", "month")
        city = request.query_params.get("city")
        item_id = request.query_params.get("item_id")

        end = date.today()
        if period == "week":
            cur_start = end - timedelta(days=7)
            prev_start = end - timedelta(days=14)
            prev_end = end - timedelta(days=7)
        else:
            cur_start = end - timedelta(days=30)
            prev_start = end - timedelta(days=60)
            prev_end = end - timedelta(days=30)

        def _avg(start_d, end_d):
            qs = PriceSubmission.objects.filter(
                status="approved",
                date_observed__gte=start_d,
                date_observed__lte=end_d,
            )
            if city:
                qs = qs.filter(city__iexact=city)
            if item_id:
                qs = qs.filter(item_id=item_id)
            a = qs.aggregate(v=Avg("price_value"))
            return a["v"]

        cur_avg = _avg(cur_start, end)
        prev_avg = _avg(prev_start, prev_end)
        change_pct = None
        if cur_avg and prev_avg and prev_avg > 0:
            change_pct = float((cur_avg - prev_avg) / prev_avg * 100)

        return Response(
            {
                "period": period,
                "city": city,
                "item_id": int(item_id) if item_id else None,
                "current_avg": str(round(cur_avg, 4)) if cur_avg else None,
                "previous_avg": str(round(prev_avg, 4)) if prev_avg else None,
                "change_percent": round(change_pct, 2) if change_pct is not None else None,
            }
        )


class MarketCategoriesView(APIView):
    """GET /api/market/categories/ — distinct product categories (from tracked items)."""

    permission_classes = [AllowAny]

    def get(self, request):
        names = (
            Item.objects.values_list("category", flat=True)
            .distinct()
            .order_by("category")
        )
        return Response([{"name": c} for c in names if c])


class NationalPriceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = NationalPrice.objects.select_related("item").all()
        item_id = request.query_params.get("item_id")
        city = request.query_params.get("city")
        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")
        if item_id:
            qs = qs.filter(item_id=item_id)
        if city:
            qs = qs.filter(city__iexact=city)
        if from_date:
            qs = qs.filter(date__gte=from_date)
        if to_date:
            qs = qs.filter(date__lte=to_date)
        qs = qs.order_by("-date")[:500]
        return Response(
            [
                {
                    "id": r.id,
                    "item_id": r.item_id,
                    "item_name": r.item.name,
                    "price": str(r.price),
                    "source": r.source,
                    "city": r.city,
                    "date": r.date.isoformat(),
                }
                for r in qs
            ]
        )


class AdminMLRetrainView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request):
        weeks = int(request.data.get("forecast_weeks", 4))
        rows_created = 0
        item_count = 0
        for item in Item.objects.all():
            hist = list(
                PriceSubmission.objects.filter(item=item, status="approved")
                .order_by("-date_observed")
                .values_list("price_value", flat=True)[:8]
            )
            if not hist:
                continue
            item_count += 1
            avg = sum([Decimal(str(x)) for x in hist]) / Decimal(len(hist))
            base = avg.quantize(Decimal("0.01"))
            Forecast.objects.filter(item=item).delete()
            for i in range(1, weeks + 1):
                drift = Decimal("1.00") + (Decimal("0.01") * Decimal(i - 1))
                pred = (base * drift).quantize(Decimal("0.01"))
                low = (pred * Decimal("0.96")).quantize(Decimal("0.01"))
                high = (pred * Decimal("1.04")).quantize(Decimal("0.01"))
                Forecast.objects.create(
                    item=item,
                    forecast_date=date.today() + timedelta(weeks=i),
                    predicted_price=pred,
                    confidence_low=low,
                    confidence_high=high,
                    model_used="moving_average_v1",
                )
                rows_created += 1
        run = ForecastRun.objects.create(
            model_used="moving_average_v1",
            status="success",
            item_count=item_count,
            detail={"rows_created": rows_created, "forecast_weeks": weeks},
        )
        AuditLog.objects.create(
            actor=request.user,
            action="ml_retrain",
            resource="forecast",
            resource_id=str(run.id),
            detail=run.detail,
        )
        return Response(
            {
                "detail": "Forecast retraining completed.",
                "rows_created": rows_created,
                "item_count": item_count,
            },
            status=status.HTTP_200_OK,
        )


class AdminMLStatusView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        run = ForecastRun.objects.order_by("-created_at").first()
        if not run:
            return Response({"detail": "No ML run yet."}, status=status.HTTP_200_OK)
        return Response(
            {
                "id": run.id,
                "model_used": run.model_used,
                "status": run.status,
                "item_count": run.item_count,
                "detail": run.detail,
                "created_at": run.created_at,
            }
        )


class MySubmissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """PATCH/DELETE own submission — pending or rejected only (edit/resubmit/delete)."""
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return PriceSubmission.objects.filter(user=self.request.user).select_related("item")

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return PriceSubmissionSerializer
        return MySubmissionSerializer

    def perform_update(self, serializer):
        serializer.save(status="pending", rejection_reason="")

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status not in ("pending", "rejected"):
            return Response(
                {"detail": "Only pending or rejected submissions can be edited."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status != "pending":
            return Response(
                {"detail": "Only pending submissions can be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class MySubmissionsListView(generics.ListAPIView):
    """GET /api/market/prices/my-submissions/ — current user's own submissions."""
    permission_classes = [IsAuthenticated]
    serializer_class = MySubmissionSerializer

    def get_queryset(self):
        qs = PriceSubmission.objects.filter(
            user=self.request.user
        ).select_related('item').order_by('-created_at')
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter in ('pending', 'approved', 'rejected'):
            qs = qs.filter(status=status_filter)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        start = (page - 1) * page_size
        end = start + page_size
        total = queryset.count()
        items = queryset[start:end]
        serializer = self.get_serializer(items, many=True)
        return Response({
            'results': serializer.data,
            'pagination': {
                'total_records': total,
                'total_pages': (total + page_size - 1) // page_size,
                'page_size': page_size,
                'current_page': page,
            }
        })


class ContributorStatsView(APIView):
    """GET /api/market/prices/contributor-stats/ — gamification stats for current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        total = PriceSubmission.objects.filter(user=user).count()
        approved = PriceSubmission.objects.filter(user=user, status='approved').count()
        pending = PriceSubmission.objects.filter(user=user, status='pending').count()
        rejected = PriceSubmission.objects.filter(user=user, status='rejected').count()

        # Points: 10 per approved, 2 per pending
        points = approved * 10 + pending * 2

        # Contributor level
        if approved >= 100:
            level = 'Top Contributor'
            badge_color = 'gold'
        elif approved >= 25:
            level = 'Active Contributor'
            badge_color = 'silver'
        else:
            level = 'New Contributor'
            badge_color = 'bronze'

        # Rank progress to next level
        if approved >= 100:
            rank_progress = 100
        elif approved >= 25:
            rank_progress = min(100, int((approved - 25) / 75 * 100))
        else:
            rank_progress = min(100, int(approved / 25 * 100))

        # Weekly stats
        week_ago = date.today() - timedelta(days=7)
        week_submissions = PriceSubmission.objects.filter(
            user=user, created_at__date__gte=week_ago
        ).count()
        total_week_submissions = PriceSubmission.objects.filter(
            created_at__date__gte=week_ago
        ).count()

        # Unique items and markets covered
        items_covered = PriceSubmission.objects.filter(user=user).values('item').distinct().count()
        markets_covered = PriceSubmission.objects.filter(user=user).values('market_location').distinct().count()

        return Response({
            'total_submissions': total,
            'approved': approved,
            'pending': pending,
            'rejected': rejected,
            'points': points,
            'level': level,
            'badge_color': badge_color,
            'rank_progress': rank_progress,
            'week_submissions': week_submissions,
            'total_week_submissions': total_week_submissions,
            'items_covered': items_covered,
            'markets_covered': markets_covered,
        })


class ItemAveragesView(APIView):
    """GET /api/market/prices/item-averages/ — price context for a specific item."""
    permission_classes = [AllowAny]

    def get(self, request):
        item_id = request.query_params.get('item_id')
        if not item_id:
            return Response({'detail': 'item_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        location = request.query_params.get('location')
        city = request.query_params.get('city')

        # National average
        national_qs = PriceSubmission.objects.filter(item_id=item_id, status='approved')
        national_avg = national_qs.aggregate(avg=Avg('price_value'))['avg']

        # City average
        city_avg = None
        if city:
            city_qs = national_qs.filter(city__iexact=city)
            city_avg = city_qs.aggregate(avg=Avg('price_value'))['avg']

        # Location average
        location_avg = None
        if location:
            loc_qs = national_qs.filter(market_location__icontains=location)
            if city:
                loc_qs = loc_qs.filter(city__iexact=city)
            location_avg = loc_qs.aggregate(avg=Avg('price_value'))['avg']

        # Recent submissions for same item/location
        recent_qs = PriceSubmission.objects.filter(
            item_id=item_id, status='approved'
        ).order_by('-date_observed')
        if location:
            recent_qs = recent_qs.filter(market_location__icontains=location)
        recent = recent_qs[:3]
        recent_data = [
            {
                'price': str(s.price_value),
                'date': s.date_observed.isoformat(),
                'location': s.market_location,
                'city': s.city,
            }
            for s in recent
        ]

        # Total submission count
        total_count = national_qs.count()

        return Response({
            'item_id': int(item_id),
            'national_average': str(round(national_avg, 2)) if national_avg else None,
            'city_average': str(round(city_avg, 2)) if city_avg else None,
            'location_average': str(round(location_avg, 2)) if location_avg else None,
            'recent_submissions': recent_data,
            'total_submissions': total_count,
        })
