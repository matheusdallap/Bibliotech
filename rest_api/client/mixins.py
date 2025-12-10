# client/mixins.py
from django.contrib.admin.models import LogEntry, ADDITION, CHANGE, DELETION
from django.contrib.contenttypes.models import ContentType

class AdminLogMixin:
    """
    Mixin para registrar ações (Create, Update, Delete) no histórico do Django Admin.
    Deve ser usado em Views do DRF (Generics ou ViewSets).
    """

    def _log_action(self, user, obj, action_flag, message=""):
        """Função auxiliar para criar o registro na tabela LogEntry"""
        if not user.is_authenticated:
            return

        LogEntry.objects.log_action(
            user_id=user.pk,
            content_type_id=ContentType.objects.get_for_model(obj).pk,
            object_id=obj.pk,
            object_repr=str(obj),
            action_flag=action_flag,
            change_message=message
        )

    def perform_create(self, serializer):
        """Sobrescreve o salvamento da criação para adicionar log"""
        obj = serializer.save()
        self._log_action(self.request.user, obj, ADDITION, "Criado via API")

    def perform_update(self, serializer):
        """Sobrescreve o salvamento da edição para adicionar log"""
        obj = serializer.save()
        self._log_action(self.request.user, obj, CHANGE, "Editado via API")

    def perform_destroy(self, instance):
        """Sobrescreve a deleção para adicionar log"""
        # Salva dados antes de deletar para o log
        user = self.request.user
        obj_repr = str(instance)
        content_type_id = ContentType.objects.get_for_model(instance).pk
        obj_id = instance.pk

        instance.delete()

        # Log manual (pois o objeto não existe mais para usar o helper padrão do LogEntry)
        LogEntry.objects.create(
            user_id=user.pk,
            content_type_id=content_type_id,
            object_id=obj_id,
            object_repr=obj_repr,
            action_flag=DELETION,
            change_message="Deletado via API"
        )