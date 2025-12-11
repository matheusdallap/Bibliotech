from rest_framework import generics, permissions, status
from rest_framework.response import Response # <--- Necessário
from rest_framework.permissions import IsAdminUser
from .models import Book, Comment
from .serializers import BookSerializer, CommentSerializer
from client.mixins import AdminLogMixin 

# --- VIEWS PÚBLICAS ---

class BookListView(generics.ListAPIView):
    """
    Lista todos os livros (Público).
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "Lista de livros recuperada.",
            "data": serializer.data
        })

class BookDetailView(generics.RetrieveAPIView):
    """
    Exibe os detalhes de um livro específico (Público).
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "Detalhes do livro recuperados.",
            "data": serializer.data
        })


# --- VIEWS ADMINISTRATIVAS ---

class AdminBookView(AdminLogMixin, generics.ListCreateAPIView):
    """
    Admin: Lista (com detalhes de admin) e Cria Livros.
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAdminUser]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "Lista administrativa recuperada.",
            "data": serializer.data
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response({
                "success": True,
                "message": "Livro criado com sucesso!",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED, headers=headers)
        else:
            # Pega o primeiro erro legível
            first_error = next(iter(serializer.errors.values()))[0]
            return Response({
                "success": False,
                "message": first_error,
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class AdminBookDetailView(AdminLogMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Admin: Vê detalhes, Atualiza ou Deleta um livro.
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAdminUser]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "Detalhes do livro recuperados.",
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
                "message": "Livro atualizado com sucesso.",
                "data": serializer.data
            })
        else:
            first_error = next(iter(serializer.errors.values()))[0]
            return Response({
                "success": False,
                "message": first_error,
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "success": True,
            "message": "Livro removido com sucesso."
        }, status=status.HTTP_200_OK)


# --- COMENTÁRIOS ---

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

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "Comentários recuperados.",
            "data": serializer.data
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response({
                "success": True,
                "message": "Comentário postado!",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED, headers=headers)
        else:
            first_error = next(iter(serializer.errors.values()))[0]
            return Response({
                "success": False,
                "message": first_error,
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)