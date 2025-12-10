from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView

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

class LogoutView(APIView):
    """
    Recebe o refresh token e o coloca na blacklist, invalidando-o.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout realizado com sucesso."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Token inválido ou não fornecido."}, status=status.HTTP_400_BAD_REQUEST)