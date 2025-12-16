from django.urls import path
from .views import RegisterView, CustomerListView, CustomerDetailView, LoginView, LogoutView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path('logout/', LogoutView.as_view(), name='logout'),
    path("users/", CustomerListView.as_view(), name="users-list"),
    path("users/<int:pk>/", CustomerDetailView.as_view(), name="user-detail"),
]
