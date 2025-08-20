from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

class Usuario(AbstractUser):
    TIPO_USUARIO = [
        ('A', 'Administrador'),
        ('B', 'Bibliotecário'),
        ('L', 'Leitor'),
    ]

    tipo = models.CharField(max_length=1, choices=TIPO_USUARIO, default='L')
    matricula = models.CharField(max_length=20, unique=True)
    telefone = models.CharField(max_length=20, blank=True)
    endereco = models.TextField(blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    foto = models.ImageField(upload_to='usuarios/', null=True, blank=True)
    limite_emprestimos = models.PositiveBigIntegerField(default=3)
    multa_acumulada = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The group this user belongs to',
        related_name='bibliotech_usuario_set',
        related_query_name='bibliotech_usuario',
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='bibliotech_usuario_permissions_set',
        related_query_name='bibliotech_usuario_permissions',
    )

    def __str__(self):
        return f"{self.get_full_name()} ({self.matricula})"
    
    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"

class Autor(models.Model):
    nome = models.CharField(max_length=100)
    data_nascimento = models.DateField(null=True, blank=True)
    biografia = models.TextField(blank=True)
    foto = models.ImageField(upload_to='autores/', null=True, blank=True)

    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name_plural = "Autores"

class Editora(models.Model):
    nome = models.CharField(max_length=100)
    site = models.URLField(blank=True)
    telefone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.nome
    
class Genero(models.Model):
    nome = models.CharField(max_length=50)
    descricao = models.TextField(blank=True)

    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = "Gênero"
        verbose_name_plural = "Gêneros"

class Livro(models.Model):
    STATUS_DISPONIVEL = 'D'
    STATUS_EMPRESTADO = 'E'
    STATUS_RESERVADO = 'R'
    STATUS_MANUTENCAO = 'M'

    STATUS_CHOICES = [
        (STATUS_DISPONIVEL, 'Disponivel'),
        (STATUS_EMPRESTADO, 'Emprestado'),
        (STATUS_RESERVADO, 'Reservado'),
        (STATUS_MANUTENCAO, 'Em manutenção'),
    ]

    titulo = models.CharField(max_length=200)
    isbn = models.CharField('ISBN', max_length=13, unique=True)
    autores = models.ManyToManyField(Autor)
    editora = models.ForeignKey(Editora, on_delete=models.SET_NULL, null=True)
    genero = models.ForeignKey(Genero, on_delete=models.SET_NULL, null=True)
    ano_publicacao = models.PositiveIntegerField()
    edicao = models.PositiveSmallIntegerField(default=1)
    paginas = models.PositiveIntegerField()
    sinopse = models.TextField(blank=True)
    capa = models.ImageField(upload_to='capas/', null=True, blank=True)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default=STATUS_DISPONIVEL)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    quantidade = models.PositiveIntegerField(default=1)
    quantidade_disponivel = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.titulo} ({self.ano_publicacao})"
    
    class Meta:
        verbose_name_plural = "Livros"
        ordering = ['titulo']

class Emprestimo(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    livro = models.ForeignKey(Livro, on_delete=models.CASCADE)
    data_emprestimo = models.DateTimeField(auto_now_add=True)
    data_evolucao_prevista = models.DateTimeField()
    data_devolucao_real = models.DateTimeField(null=True, blank=True)
    multa = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    status = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.usuario.get_full_name()} - {self.livro.titulo}"
    
    class Meta:
        verbose_name = "Empréstimo"
        verbose_name_plural = "Empréstimos"

class Reserva(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    livro = models.ForeignKey(Livro, on_delete=models.CASCADE)
    data_reserva = models.DateTimeField(auto_now_add=True)
    data_expiracao = models.DateTimeField()
    status = models.BooleanField(default=True)

    def __str__(self):
        return f"Reserva de {self.livro.titulo} por {self.usuario.get_full_name()}"
    
    class Meta:
        verbose_name_plural = "Reservas"

class Avaliacao(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    livro = models.ForeignKey(Livro, on_delete=models.CASCADE)
    nota = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comentario = models.TextField(blank=True)
    data_avaliacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Avaliação de {self.usuario.get_full_name()} para {self.livro.titulo}"
    
    class Meta:
        verbose_name = "Avaliação"
        verbose_name_plural = "Avaliações"
        unique_together = ['usuario', 'livro']

# Create your models here.