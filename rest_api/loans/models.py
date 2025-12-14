from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from books.models import Book

class Loan(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loans')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='loans')
    
    # Datas
    loan_date = models.DateTimeField(auto_now_add=True) # Data que pegou (Automático)
    due_date = models.DateTimeField() # Data que tem que devolver
    returned_at = models.DateTimeField(null=True, blank=True) # Data real da devolução (Nulo enquanto estiver com o livro)

    class Meta:
        ordering = ['-loan_date']

    def save(self, *args, **kwargs):
        # Se não definiu data de entrega, põe 14 dias pra frente
        if not self.due_date:
            self.due_date = timezone.now() + timedelta(days=14)
        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        """Verifica se está atrasado: Passou da data prevista E ainda não devolveu."""
        if self.returned_at:
            return False # Já devolveu, não está atrasado
        return timezone.now() > self.due_date

    def __str__(self):
        return f"{self.user.username} pegou {self.book.title}"