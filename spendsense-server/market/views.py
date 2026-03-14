from django.db.models import Avg
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PriceSubmission
from .serializers import PriceSubmissionSerializer


class SubmitPriceView(APIView):
    """POST /api/market/prices/submit/ — submit a price report (crowdsourcing)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PriceSubmissionSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        # Optional: flag outlier vs recent average for same item/city
        item = serializer.validated_data.get('item')
        city = serializer.validated_data.get('city')
        price_value = serializer.validated_data.get('price_value')
        recent = PriceSubmission.objects.filter(
            item=item, city=city, status='approved',
        ).aggregate(avg=Avg('price_value'))
        avg = recent.get('avg')
        submission = serializer.save()
        if avg is not None:
            from decimal import Decimal
            pct = abs(float(price_value - avg) / float(avg)) * 100
            if pct > 50:
                submission._outlier_warning = (
                    f'Price differs by {pct:.0f}% from recent average ({avg:.2f}).'
                )
        return Response(
            PriceSubmissionSerializer(submission, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
