from rest_framework import generics, permissions
from rest_framework.permissions import IsAdminUser
from .models import Book
from .serializers import BookSerializer
from client.mixins import AdminLogMixin 

class BookListView(generics.ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]

# Adicione AdminLogMixin NA FRENTE de generics.ListCreateAPIView
class AdminBookView(AdminLogMixin, generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAdminUser]

# Adicione AdminLogMixin NA FRENTE de generics.RetrieveUpdateDestroyAPIView
class AdminBookDetailView(AdminLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAdminUser]