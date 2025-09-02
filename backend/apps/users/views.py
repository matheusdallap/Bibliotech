from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.http import HttpResponse
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import re

def index(request):
    return HttpResponse("Bibliotech starts here.")

class createUserView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        login_name = request.POST.get("login")
        password = request.POST.get("password")
        email = request.POST.get("email")

        if not login_name or not password or not email:
            return Response(
                {"status": "error", "message": "Login, senha e email são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST
            )
        
        if not self.is_valid_email(email):
            return Response(
                {"status": "error", "message": "Formato de email inválido."}, status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=login_name).exists():
            return Response(
                {"status": "error", "message": "Usuário ja existe."}, status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {"status": "error", "message": "Email já está em uso."}, status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.create_user(
            username=login_name,
            password=password, 
            email=email
        )

        return Response(
                {"status": "success", "message": "Usuário criado com sucesso!"}, status=status.HTTP_201_CREATED
            )
    
    def is_valid_email(self, email):
        try:
            validate_email(email)
            return True
        except ValidationError:
            return False

class loginUserView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        login_identifier = request.data.get("login")
        password = request.data.get("password")

        if not login_identifier or not password:
            return Response(
                {"status": "error", "message": "Login e senha são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST
            )
        
        user = self.authenticate_user(login_identifier, password)

        if user is not None:
            login(request, user)
            return Response({
                "status": "success",
                "message": "Olá!",
                "user_type": "user",
                "username": user.username,
                "email": user.email
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"status": "error", "message": "Credenciais incorretas."}, status=status.HTTP_400_BAD_REQUEST
            )
        
    def authenticate_user(self, identifier, password):
        try:
            validate_email(identifier)
            try:
                user = User.objects.get(email=identifier)
                return authenticate(username=user.username, password=password)
            except User.DoesNotExist:
                pass
        except ValidationError:
            pass

        return authenticate(username=identifier, password=password)