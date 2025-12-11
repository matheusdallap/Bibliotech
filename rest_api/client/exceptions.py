from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        
        original_data = response.data
        message = "Ocorreu um erro na requisição."
        
        if isinstance(original_data, dict):
            message = original_data.get('detail', message)
        
        if "token_not_valid" in str(original_data) or "Given token not valid" in str(message):
            message = "Sua sessão expirou ou o token é inválido. Faça login novamente."
        
        if response.status_code == 403:
            message = "Você não tem permissão para realizar esta ação."

        if response.status_code == 404:
            message = "Recurso não encontrado."

        response.data = {
            "success": False,
            "message": message,
            "errors": original_data
        }

    return response