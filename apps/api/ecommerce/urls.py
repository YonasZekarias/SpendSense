from django.urls import path

from . import views

app_name = 'ecommerce'

urlpatterns = [
    path('vendors/<uuid:vendor_id>/reviews/', views.VendorReviewListCreateView.as_view(), name='vendor-reviews'),
    path('vendors/<uuid:vendor_id>/listings/', views.VendorListingListCreateView.as_view(), name='vendor-listings'),
    path('vendors/<uuid:pk>/', views.VendorDetailView.as_view(), name='vendor-detail'),
    path('vendors/', views.VendorRegisterView.as_view(), name='vendor-register'),
    path('listings/<int:pk>/', views.VendorListingUpdateView.as_view(), name='listing-detail'),
    path('recommendations/', views.RecommendationsView.as_view(), name='recommendations'),
    path('purchases/<uuid:pk>/', views.PurchaseDetailView.as_view(), name='purchase-detail'),
    path('purchases/', views.PurchaseListCreateView.as_view(), name='purchase-list'),
    path('admin/vendors/<uuid:pk>/verify/', views.AdminVendorVerifyView.as_view(), name='admin-vendor-verify'),
    path('admin/vendors/<uuid:pk>/reject/', views.AdminVendorRejectView.as_view(), name='admin-vendor-reject'),
    path('admin/vendors/', views.AdminVendorListView.as_view(), name='admin-vendor-list'),
]
