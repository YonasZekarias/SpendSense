from django.urls import path

from .admin_views import AdminAuditListView, AdminSettingsView

urlpatterns = [
    path('settings/', AdminSettingsView.as_view(), name='admin-settings'),
    path('audit/', AdminAuditListView.as_view(), name='admin-audit'),
]
