from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.http import HttpResponse

def index(request):
    return HttpResponse("Bibliotech starts here.")

class CreateUserView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        login_name = request.POST.get("login")
        password = request.POST.get("password")

        if not login_name or not password:
            return Response(
                {"status": "error", "message": "Login e senha são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=login_name).exists():
            return Response(
                {"status": "error", "message": "Usuario ja existe."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.create_user(username=login_name, password=password)
        return Response(
            {"status": "success", "message": "Usuario criado com sucesso!"},
            status=status.HTTP_201_CREATED
        )
    
class LoginUserView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        login_name = request.POST.get("login")
        password = request.POST.get("password")

        if not login_name or password:
            return Response(
                {"status": "error", "message": "Login e senha são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=login_name, password=password)

        if user is not None:
            login(request, user)
            return Response({
                "status": "success",
                "message": "Hello!",
                "user_type": "user"
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"status": "error", "message": "Login ou senha incorretos."},
                status=status.HTTP_400_BAD_REQUEST
            )