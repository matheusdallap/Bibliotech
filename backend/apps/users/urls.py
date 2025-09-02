from django.urls import path
from .views import createUserView, loginUserView

urlpatterns = [
    path('create-user/', createUserView.as_view(), name='create_user'),
    path('login/', loginUserView.as_view(), name ='login_user'),
]