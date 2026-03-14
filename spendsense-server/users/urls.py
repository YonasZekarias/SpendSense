from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from users.views import LoginView, MeView, OnboardingView, SignupView

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("onboarding/", OnboardingView.as_view(), name="onboarding"),
]
