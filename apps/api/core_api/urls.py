"""
URL configuration for core_api project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from users.views import EmailTokenObtainPairView

schema_view = get_schema_view(
    openapi.Info(
        title='SpendSense API',
        default_version='v1',
        description='SpendSense Ethiopia — Cost of Living, Budget & Smart Shopping API',
    ),
        permission_classes=(permissions.AllowAny,),  # 👈 ADD THIS
    public=True,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Swagger / OpenAPI
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # JWT auth (accepts email + password)
    path('api/auth/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # API apps
    path('api/users/', include('users.urls')),
    path('api/market/', include('market.urls')),
    path('api/finance/', include('finance.urls')),
    path('api/ecommerce/', include('ecommerce.urls')),
]
