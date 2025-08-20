from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('create-user/', views.CreateUserView.as_view(), name='create_user'),
    path('login/', views.LoginUserView.as_view(), name='login_user'),
]