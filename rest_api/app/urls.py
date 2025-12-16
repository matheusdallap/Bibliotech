from django.contrib import admin
from django.urls import path, include
from .views import health
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health),
    path('client/', include('client.urls')),
    path('books/', include('books.urls')),
    path('loans/', include('loans.urls')),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )