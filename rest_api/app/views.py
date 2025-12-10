from django.http import JsonResponse
from django.db import connection

def health(request):
    try:
        connection.cursor()  # testa se o banco responde
        return JsonResponse({"status": "ok", "db": "connected"})
    except Exception as e:
        return JsonResponse({"status": "error", "db": str(e)}, status=500)
