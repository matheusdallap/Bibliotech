from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Loan
from .serializers import LoanSerializer

class LoanCreateListView(generics.ListCreateAPIView):
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated] # Critério: Usuário logado

    def get_queryset(self):
        # Filtra para trazer apenas os empréstimos do usuário logado
        # Ordena do mais recente para o mais antigo
        return Loan.objects.filter(user=self.request.user).order_by('-loan_date')

    # PADRONIZAÇÃO DO GET (LISTA)
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "Meus empréstimos recuperados.",
            "data": serializer.data
        })

    # PADRONIZAÇÃO DO POST (CRIAR EMPRÉSTIMO)
    def create(self, request, *args, **kwargs):
        # O contexto {'request': request} é crucial para o Serializer pegar o user logado
        serializer = self.get_serializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response({
                "success": True,
                "message": "Empréstimo realizado com sucesso!",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED, headers=headers)
        else:
            # Pega o primeiro erro legível (ex: "Livro indisponível" ou "Limite atingido")
            first_error = next(iter(serializer.errors.values()))[0]
            if isinstance(first_error, list): 
                first_error = first_error[0]

            return Response({
                "success": False,
                "message": first_error,
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

class LoanDetailView(generics.RetrieveUpdateAPIView):
    """
    Endpoint para ver detalhes de UM empréstimo ou Devolver o livro.
    Método PATCH marca como devolvido.
    """
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Garante que o usuário só consiga mexer nos PRÓPRIOS empréstimos
        return Loan.objects.filter(user=self.request.user)

    # PADRONIZAÇÃO DO GET (Ver Detalhes)
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "Detalhes do empréstimo recuperados.",
            "data": serializer.data
        })

    # A MÁGICA DA DEVOLUÇÃO (PATCH)
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # CRITÉRIO: Se tentar devolver algo que já foi devolvido, dá erro.
        if instance.returned_at is not None:
            return Response({
                "success": False,
                "message": "Este livro já foi devolvido anteriormente.",
                "errors": {"status": "Already returned"}
            }, status=status.HTTP_400_BAD_REQUEST)

        # AÇÃO: Marca a data de agora como data de devolução
        instance.returned_at = timezone.now()
        instance.save()

        # Retorna os dados atualizados
        serializer = self.get_serializer(instance)
        
        return Response({
            "success": True,
            "message": "Livro devolvido com sucesso!",
            "data": serializer.data
        }, status=status.HTTP_200_OK)