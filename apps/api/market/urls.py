from django.urls import path

from . import views

app_name = 'market'

urlpatterns = [
    path('items/', views.ItemListView.as_view(), name='item-list'),
    path('items/<int:pk>/', views.ItemDetailView.as_view(), name='item-detail'),
    path('prices/submit/', views.SubmitPriceView.as_view(), name='price-submit'),
    path('prices/averages/', views.PriceAveragesView.as_view(), name='price-averages'),
    path('trends/', views.PriceTrendsView.as_view(), name='price-trends'),
    path('forecasts/', views.PriceForecastsView.as_view(), name='price-forecasts'),
    path('inflation/', views.InflationView.as_view(), name='inflation'),
    path('national-prices/', views.NationalPriceListView.as_view(), name='national-prices'),
    path('admin/submissions/', views.AdminPendingSubmissionsView.as_view(), name='admin-submissions-pending'),
    path('admin/submissions/<int:pk>/', views.AdminSubmissionDetailView.as_view(), name='admin-submission-detail'),
    path('admin/submissions/<int:pk>/approve/', views.AdminSubmissionApproveView.as_view(), name='admin-submission-approve'),
    path('admin/submissions/<int:pk>/reject/', views.AdminSubmissionRejectView.as_view(), name='admin-submission-reject'),
]
