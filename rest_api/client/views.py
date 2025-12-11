from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import get_user_model

from .serializers import CustomerSerializer, RegisterSerializer, CustomLoginSerializer
from .permissions import IsAdminOrSelf
from .mixins import AdminLogMixin

Customer = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Endpoint público para criar usuários.
    Retorna: { "success": true, "message": "...", "data": {...} }
    """
    queryset = Customer.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "success": True,
                    "message": "Conta criada com sucesso!",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        else:
            return Response(
                {
                    "success": False,
                    "message": "Erro ao criar conta. Verifique os dados.",
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class LoginView(TokenObtainPairView):
    """
    Login customizado.
    Intercepta a resposta padrão do JWT para adicionar o envelope 'success'.
    """
    serializer_class = CustomLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        # Tenta executar o login padrão da biblioteca
        try:
            response = super().post(request, *args, **kwargs)
            
            # Se chegou aqui e o status é 200, deu certo
            if response.status_code == status.HTTP_200_OK:
                return Response({
                    "success": True,
                    "message": "Login realizado com sucesso.",
                    "data": response.data
                }, status=status.HTTP_200_OK)
            
            # Caso contrário, retorna o erro original mas envelopado
            return Response({
                "success": False,
                "message": "Erro ao realizar login.",
                "errors": response.data
            }, status=response.status_code)

        except (InvalidToken, TokenError) as e:
            return Response({
                "success": False,
                "message": "Credenciais inválidas ou erro no token.",
                "errors": str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    Logout com resposta padronizada.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            
            if not refresh_token:
                return Response({
                    "success": False,
                    "message": "Refresh token é obrigatório para logout."
                }, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                "success": True,
                "message": "Logout realizado com sucesso."
            }, status=status.HTTP_205_RESET_CONTENT)
            
        except Exception as e:
            return Response({
                "success": False,
                "message": "Token inválido ou expirado.",
                "errors": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


# --- Views Administrativas / Listagem (Geralmente retornam direto, mas podemos padronizar se quiser) ---

class CustomerListView(generics.ListAPIView):
    """
    Lista todos os usuários.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAdminUser]

    # Padroniza o GET da Lista
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "Lista de usuários recuperada com sucesso.",
            "data": serializer.data
        })


class CustomerDetailView(AdminLogMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    GET, PUT, PATCH, DELETE com respostas padronizadas.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSelf]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "Perfil recuperado com sucesso.",
            "data": serializer.data
        })

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response({
                "success": True,
                "message": "Perfil atualizado com sucesso.",
                "data": serializer.data
            })
        else:
            return Response({
                "success": False,
                "message": "Erro ao atualizar perfil.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "success": True,
            "message": "Usuário removido com sucesso."
        }, status=status.HTTP_200_OK)