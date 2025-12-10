from django.urls import path
from .views import (
    BookListView,
    AdminBookView,
    AdminBookDetailView
)

urlpatterns = [
    # Qualquer pessoa pode listar os livros
    path("", BookListView.as_view(), name="book-list"),

    # Admin pode criar livros
    path("admin/", AdminBookView.as_view(), name="admin-book-list-create"),

    # Admin pode ver/editar/deletar um livro pelo ID
    path("admin/<int:pk>/", AdminBookDetailView.as_view(), name="admin-book-detail"),
]
