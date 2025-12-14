from django.urls import path
from .views import LoanCreateListView, LoanDetailView

urlpatterns = [
    path('', LoanCreateListView.as_view(), name='loans-list-create'),
    path('<int:pk>/', LoanDetailView.as_view(), name='loan-detail'),
]