from datetime import timedelta

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from users.serializers import LoginSerializer, OnboardingSerializer, SignupSerializer, UserSerializer


def _build_token_payload(user, remember_me):
    refresh = RefreshToken.for_user(user)
    if remember_me:
        refresh.set_exp(lifetime=timedelta(days=30))
    else:
        refresh.set_exp(lifetime=timedelta(days=1))
    access = refresh.access_token
    access.set_exp(lifetime=timedelta(minutes=15))
    return {"access": str(access), "refresh": str(refresh)}


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        remember_me = serializer.validated_data.get("remember_me", False)
        tokens = _build_token_payload(user, remember_me)

        return Response(
            {
                "message": "Account created successfully.",
                "tokens": tokens,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        remember_me = serializer.validated_data.get("remember_me", False)
        tokens = _build_token_payload(user, remember_me)

        return Response(
            {
                "message": "Logged in successfully.",
                "tokens": tokens,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"user": UserSerializer(request.user).data}, status=status.HTTP_200_OK)


class OnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = OnboardingSerializer(instance=request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"message": "Onboarding completed.", "user": UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )
