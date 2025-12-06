from rest_framework import generics, permissions
from django.contrib.auth import get_user_model

from rest_framework_simplejwt.views import TokenObtainPairView  # <-- LOGIN JWT

from .serializers import (
    CustomerSerializer,
    RegisterSerializer,
)
from .permissions import IsAdminOrSelf

Customer = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Endpoint público para criar usuários.
    """
    queryset = Customer.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    """
    Login usando JWT.
    Retorna access e refresh tokens.
    """
    permission_classes = [permissions.AllowAny]


class CustomerListView(generics.ListAPIView):
    """
    Lista todos os usuários — somente admin pode acessar.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAdminUser]


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Usuário autenticado pode visualizar ou editar APENAS seu próprio perfil.
    Admin pode tudo.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSelf]
