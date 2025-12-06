from rest_framework import permissions

class IsAdminOrSelf(permissions.BasePermission):
    """
    Permite que o admin acesse qualquer usuário.
    Usuários comuns só podem acessar o próprio objeto.
    """

    def has_object_permission(self, request, view, obj):
        # Admin tem acesso total
        if request.user.is_staff:
            return True

        # Usuário comum só pode acessar a si mesmo
        return obj.id == request.user.id
