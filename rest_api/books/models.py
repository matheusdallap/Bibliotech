from django.db import models

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
    author = models.ForeignKey(
        Author, 
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    publisher = models.ForeignKey(
        Publisher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    genre = models.CharField(max_length=100, null=True, blank=True) 
    page_count = models.IntegerField(null=True, blank=True)         
    publication_date = models.DateField(null=True, blank=True)      
    image = models.ImageField(upload_to="book_covers/", null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    continuation = models.ManyToManyField(
        "self",
        symmetrical=False,
        blank=True,
        related_name="related_continuations"
    )

    def __str__(self):
        return self.title