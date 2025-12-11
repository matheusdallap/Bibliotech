from django.urls import path
from .views import (
    BookListView,
    BookDetailView,
    AdminBookView,
    AdminBookDetailView,
    BookCommentListCreateView,
)

urlpatterns = [
    path("", BookListView.as_view(), name="book-list"),
    path("<int:pk>/", BookDetailView.as_view(), name="book-detail-public"),
    path("create/", AdminBookView.as_view(), name="admin-book-list-create"),
    path("detail/<int:pk>/", AdminBookDetailView.as_view(), name="admin-book-detail"),
    path("comments/<int:book_id>/", BookCommentListCreateView.as_view(), name="book-comments"),
]