from django.urls import path
from .views import (
    BookListView,
    AdminBookView,
    AdminBookDetailView,
    BookCommentListCreateView,
)

urlpatterns = [
    path("", BookListView.as_view(), name="book-list"),
    path("admin/", AdminBookView.as_view(), name="admin-book-list-create"),
    path("admin/<int:pk>/", AdminBookDetailView.as_view(), name="admin-book-detail"),
    path("<int:book_id>/comments/", BookCommentListCreateView.as_view(), name="book-comments"),
]