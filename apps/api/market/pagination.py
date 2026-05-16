from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
import math

class CustomMarketPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        total_records = self.page.paginator.count
        page_size = self.get_page_size(self.request)
        total_pages = math.ceil(total_records / page_size) if total_records > 0 else 1

        return Response({
            'pagination': {
                'total_records': total_records,
                'total_pages': total_pages,
                'page_size': page_size,
                'current_page': self.page.number
            },
            'results': data
        })
