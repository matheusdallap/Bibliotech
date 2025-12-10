from django.urls import path
from .views import (
    BookListView,
    AdminBookView,
    AdminBookDetailView
)

urlpatterns = [
    path("", BookListView.as_view(), name="book-list"),
    path("admin/", AdminBookView.as_view(), name="admin-book-list-create"),
    path("admin/<int:pk>/", AdminBookDetailView.as_view(), name="admin-book-detail"),
]