from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import CustomTokenObtainPairSerializer


class EmailTokenObtainPairView(TokenObtainPairView):
    """JWT token view that accepts 'email' (or 'username') and 'password'."""
    serializer_class = CustomTokenObtainPairSerializer
