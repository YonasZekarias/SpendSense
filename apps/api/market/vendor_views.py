from rest_framework import generics
from rest_framework.permissions import AllowAny
from users.models import Vendor
from .serializers import MarketVendorListCardSerializer
from .pagination import CustomMarketPagination
from users.vendor_serializers import VendorLocationSerializer

class VendorListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Vendor.objects.filter(is_verified=True).select_related('owner')
    serializer_class = MarketVendorListCardSerializer
    pagination_class = CustomMarketPagination
    search_fields = ('shop_name', 'city')
    filterset_fields = ('city', 'is_verified')

class VendorLocationListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Vendor.objects.filter(is_verified=True, latitude__isnull=False, longitude__isnull=False)
    serializer_class = VendorLocationSerializer
    pagination_class = None

from .models import VendorPrice
from .serializers import VendorPriceSerializer

class ItemVendorPricesView(generics.ListAPIView):
    """GET /api/market/vendors/prices/?item_id=X — list prices from vendors for a specific item."""
    permission_classes = [AllowAny]
    serializer_class = VendorPriceSerializer

    def get_queryset(self):
        item_id = self.request.query_params.get("item_id")
        if not item_id:
            return VendorPrice.objects.none()
        return VendorPrice.objects.filter(item_id=item_id).select_related('vendor').order_by('price')


from .serializers import VendorDetailSerializer, VendorProductSerializer
from .models import VendorPrice
from rest_framework import views
from rest_framework.response import Response
from django.db.models import Min, Max
import uuid
from django.utils import timezone

class VendorDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Vendor.objects.filter(is_verified=True).select_related('owner')
    serializer_class = VendorDetailSerializer
    lookup_field = 'pk'

class VendorProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = VendorProductSerializer
    pagination_class = CustomMarketPagination

    def get_queryset(self):
        vendor_id = self.kwargs.get('pk')
        qs = VendorPrice.objects.filter(vendor_id=vendor_id).select_related('item')
        
        # filters
        category = self.request.query_params.get('category')
        if category and category.lower() != 'all':
            qs = qs.filter(item__category__icontains=category)
            
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(item__name__icontains=q)
            
        min_price = self.request.query_params.get('minPrice')
        if min_price:
            qs = qs.filter(price__gte=min_price)
            
        max_price = self.request.query_params.get('maxPrice')
        if max_price:
            qs = qs.filter(price__lte=max_price)
            
        sort_by = self.request.query_params.get('sortBy', 'popularity')
        if sort_by == 'price':
            qs = qs.order_by('price')
        else:
            qs = qs.order_by('-date')

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        serializer = self.get_serializer(page, many=True)
        paginated_res = self.get_paginated_response(serializer.data)
        
        # adding extras
        vendor_id = self.kwargs.get('pk')
        all_qs = VendorPrice.objects.filter(vendor_id=vendor_id).select_related('item')
        categories = list(all_qs.values_list('item__category', flat=True).distinct())
        agg = all_qs.aggregate(min_p=Min('price'), max_p=Max('price'))
        
        return Response({
            'pagination': paginated_res.data['pagination'],
            'categories': [c for c in categories if c],
            'priceRange': {
                'min': float(agg['min_p'] or 0),
                'max': float(agg['max_p'] or 0)
            },
            'products': paginated_res.data['results']
        })

class VendorReviewListView(views.APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        # check if page given
        page = int(request.query_params.get('page', 1))
        
        reviews = []
        if page == 1:
            reviews = [
                {
                    'id': str(uuid.uuid4()),
                    'userName': 'Abebe Kebede',
                    'userInitial': 'A',
                    'rating': 5,
                    'comment': 'Excellent service, delivery was exactly on time.',
                    'date': timezone.now().isoformat(),
                    'helpfulCount': 12,
                    'verifiedPurchase': True
                },
                {
                    'id': str(uuid.uuid4()),
                    'userName': 'Hana T.',
                    'userInitial': 'H',
                    'rating': 4,
                    'comment': 'Good prices, but took a while to find the shop.',
                    'date': (timezone.now() - timezone.timedelta(days=2)).isoformat(),
                    'helpfulCount': 3,
                    'verifiedPurchase': True
                }
            ]
            
        return Response({
            'pagination': {
                'total_records': 2,
                'total_pages': 1,
                'page_size': 10,
                'current_page': page
            },
            'reviews': reviews,
            'averageRating': 4.5,
            'totalReviews': 145,
            'distribution': {
                '1': 2,
                '2': 5,
                '3': 15,
                '4': 43,
                '5': 80
            }
        })
