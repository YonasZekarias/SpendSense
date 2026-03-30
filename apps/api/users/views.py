import logging

from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from core_api.permissions import IsAdminRole

from .models import User
from .serializers import (
    AdminUserBriefSerializer,
    AdminUserUpdateSerializer,
    CustomTokenObtainPairSerializer,
    NotificationSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)

logger = logging.getLogger(__name__)


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


class PasswordResetRequestView(APIView):
    """POST /api/users/password/reset/request/ — email link for Week 3 forgot-password flow."""

    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary='Request password reset email',
        request_body=PasswordResetRequestSerializer,
        responses={200: 'Generic success (avoids email enumeration)'},
    )
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            token = PasswordResetTokenGenerator().make_token(user)
            uid = urlsafe_base64_encode(force_bytes(str(user.pk)))
            base = settings.FRONTEND_URL.rstrip('/')
            path = settings.PASSWORD_RESET_FRONTEND_PATH
            if not path.startswith('/'):
                path = '/' + path
            reset_link = f'{base}{path}?uid={uid}&token={token}'
            subject = 'Reset your SpendSense password'
            body = (
                'You asked to reset your SpendSense password.\n\n'
                f'Open this link in your browser (valid for a limited time):\n{reset_link}\n\n'
                'If you did not request this, you can ignore this email.'
            )
            try:
                send_mail(
                    subject,
                    body,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception:
                logger.exception('Password reset email failed for %s', user.email)
                if settings.DEBUG:
                    logger.info('Password reset link (dev fallback): %s', reset_link)
        msg = (
            'If an account exists for this email, password reset instructions have been sent.'
        )
        return Response({'detail': msg}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """POST /api/users/password/reset/confirm/ — complete reset from Week 3 reset-password page."""

    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary='Confirm password reset with uid + token',
        request_body=PasswordResetConfirmSerializer,
        responses={200: 'Password updated', 400: 'Invalid or expired token'},
    )
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid_b64 = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        try:
            uid = force_str(urlsafe_base64_decode(uid_b64))
            user = User.objects.get(pk=uid, is_active=True)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response(
                {'detail': 'Invalid or expired reset link.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response(
                {'detail': 'Invalid or expired reset link.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(new_password)
        user.save(update_fields=['password'])
        return Response({'detail': 'Password has been reset.'}, status=status.HTTP_200_OK)


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
        return self.request.user.notifications.all().order_by('-created_at')


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        return self.request.user.notifications.all()
