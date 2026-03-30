from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from core_api.permissions import IsAdminRole

from .models import User
from .serializers import (
    AdminUserBriefSerializer,
    AdminUserUpdateSerializer,
    CustomTokenObtainPairSerializer,
    NotificationSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)


class EmailTokenObtainPairView(TokenObtainPairView):
    """JWT token view that accepts 'email' (or 'username') and 'password'."""
    serializer_class = CustomTokenObtainPairSerializer

    @swagger_auto_schema(
        operation_summary='Obtain JWT access & refresh tokens',
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password'],
            properties={
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_EMAIL,
                    description='User email (mapped to username for JWT).',
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_PASSWORD,
                ),
            },
        ),
        responses={200: 'Token pair (access, refresh)'},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class RegisterView(generics.CreateAPIView):
    """POST /api/users/register/ — browsable API + schema show RegisterSerializer body."""

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserProfileSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/users/me/ — browsable API uses UserProfileSerializer."""

    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = AdminUserBriefSerializer


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminRole]
    queryset = User.objects.all()
    lookup_field = 'pk'

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return AdminUserUpdateSerializer
        return AdminUserBriefSerializer


class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return self.request.user.notification_set.all().order_by('-created_at')


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        return self.request.user.notification_set.all()
