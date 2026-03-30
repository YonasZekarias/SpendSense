from django.urls import path

from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('me/notifications/<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('me/notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('me/', views.MeView.as_view(), name='me'),
    path('admin/users/<uuid:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
]
