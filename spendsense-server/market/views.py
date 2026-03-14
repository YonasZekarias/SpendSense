from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from .models import Item
from .serializers import ItemSerializer


class ItemListView(ListAPIView):
    """GET /api/market/items/ — list tracked items. Query params: category, search."""
    permission_classes = [AllowAny]
    serializer_class = ItemSerializer
    queryset = Item.objects.all().order_by('category', 'name')

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        if category:
            qs = qs.filter(category__iexact=category)
        if search:
            qs = qs.filter(name__icontains=search)
        return qs
