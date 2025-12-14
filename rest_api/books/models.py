from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Author(models.Model):
    name = models.CharField(max_length=120)

    def __str__(self):
        return self.name

class Publisher(models.Model):
    name = models.CharField(max_length=120)

    def __str__(self):
        return self.name


class Book(models.Model):
    title = models.CharField(max_length=200, unique=True)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, null=True, blank=True)
    publisher = models.ForeignKey(Publisher, on_delete=models.SET_NULL, null=True, blank=True)
    genre = models.CharField(max_length=100, null=True, blank=True) 
    page_count = models.IntegerField(null=True, blank=True)         
    publication_date = models.DateField(null=True, blank=True)      
    image = models.ImageField(upload_to="book_covers/", null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    continuation = models.ManyToManyField("self", symmetrical=False, blank=True, related_name="related_continuations")

    def __str__(self):
        return self.title

    @property
    def is_available(self):
        from loans.models import Loan
        active_loans = Loan.objects.filter(book=self, returned_at__isnull=True).count()
        return active_loans < self.quantity
        
class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="comments")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentário de {self.user} em {self.book}"