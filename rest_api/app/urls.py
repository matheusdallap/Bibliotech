from django.contrib import admin
from django.urls import path, include
from .views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health),
    path('client/', include('client.urls')),
    path('books/', include('books.urls'))
]
