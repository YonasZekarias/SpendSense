from django.urls import path

from . import views

app_name = 'market'

urlpatterns = [
    path('items/', views.ItemListView.as_view(), name='item-list'),
]
