from django.urls import path

from . import views

app_name = 'market'

urlpatterns = [
    path('prices/submit/', views.SubmitPriceView.as_view(), name='price-submit'),
]
