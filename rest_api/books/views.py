from rest_framework import generics, permissions
from rest_framework.permissions import IsAdminUser
from .models import Book
from .serializers import BookSerializer, CommentSerializer
from client.mixins import AdminLogMixin 

class BookListView(generics.ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]
    permission_classes = [permissions.AllowAny]


class AdminBookView(AdminLogMixin, generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAdminUser]


class AdminBookDetailView(AdminLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAdminUser]

# COMENTAR LIVROS
class BookCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        book_id = self.kwargs["book_id"]
        return Comment.objects.filter(book_id=book_id)

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            book_id=self.kwargs["book_id"]
        )
