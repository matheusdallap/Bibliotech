from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import CustomerSerializer, RegisterSerializer
from .permissions import IsAdminOrSelf
from .mixins import AdminLogMixin

Customer = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Endpoint público para criar usuários (Auto-cadastro).
    """
    queryset = Customer.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    """
    Login usando JWT. Retorna access e refresh tokens.
    """
    permission_classes = [permissions.AllowAny]


class CustomerListView(generics.ListAPIView):
    """
    Lista todos os usuários — somente admin pode acessar.
    (ListAPIView é apenas leitura, então não precisa de Log de alteração)
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAdminUser]


class CustomerDetailView(AdminLogMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Usuário vê seu próprio perfil. Admin vê qualquer um.
    PUT/PATCH/DELETE: Admin ou Próprio usuário alteram/deletam.
    
    *AdminLogMixin*: Registra ações de update/delete no histórico do Admin.
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
            refresh_token = request.data.get("refresh")
            
            if not refresh_token:
                return Response({"error": "Refresh token é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({"message": "Logout realizado com sucesso."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"error": "Token inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)