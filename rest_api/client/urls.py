from django.urls import path
from .views import RegisterView, CustomerListView, CustomerDetailView, LoginView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),  # <-- login adicionado

    path("users/", CustomerListView.as_view(), name="users-list"),
    path("users/<int:pk>/", CustomerDetailView.as_view(), name="user-detail"),
]
