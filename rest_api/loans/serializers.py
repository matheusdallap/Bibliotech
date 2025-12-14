from rest_framework import serializers
from .models import Loan
from books.models import Book

class LoanSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    book_title = serializers.ReadOnlyField(source='book.title')
    
    # Campo calculado para facilitar o frontend
    status = serializers.SerializerMethodField()

    class Meta:
        model = Loan
        fields = [
            'id', 
            'user', 
            'book', 
            'book_title', 
            'loan_date', 
            'due_date', 
            'returned_at', 
            'status'
        ]
        # O usuário só manda o ID do livro ('book'), o resto o sistema preenche
        read_only_fields = ['loan_date', 'due_date', 'returned_at']

    def get_status(self, obj):
        """Retorna o estado do empréstimo de forma legível."""
        if obj.returned_at:
            return "Devolvido"
        if obj.is_overdue:
            return "Atrasado"
        return "Em dia"

    def validate(self, data):
        """
        Aqui aplicamos as Regras de Negócio (Critérios de Aceitação).
        """
        request = self.context.get('request')
        user = request.user
        book = data['book']

        # Usuário não pode ter mais de 5 empréstimos ativos
        # Contamos quantos empréstimos desse usuário ainda não têm data de devolução (returned_at=None)
        active_loans_count = Loan.objects.filter(user=user, returned_at__isnull=True).count()
        
        if active_loans_count >= 5:
            raise serializers.ValidationError(
                {"error": "Você já atingiu o limite máximo de 5 empréstimos ativos."}
            )

        # CRITÉRIO: O livro deve estar disponível
        # Usa aquela propriedade is_available que criamos no model Book
        if not book.is_available:
            raise serializers.ValidationError(
                {"book": "Este livro não está disponível no estoque no momento."}
            )

        # Evitar que o usuário pegue o MESMO livro duas vezes ao mesmo tempo
        if Loan.objects.filter(user=user, book=book, returned_at__isnull=True).exists():
            raise serializers.ValidationError(
                {"book": "Você já possui um exemplar deste livro emprestado."}
            )

        return data

    def create(self, validated_data):
        # Injeta o usuário logado no momento da criação
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)