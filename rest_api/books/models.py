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
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    publisher = models.ForeignKey(
        Publisher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # Capa / imagem do livro
    image = models.ImageField(
        upload_to="book_covers/",
        null=True,
        blank=True
    )

    # Descrição do livro
    description = models.TextField(
        null=True,
        blank=True
    )

    # Continuation / trilogies
    continuation = models.ManyToManyField(
        "self",
        symmetrical=False,
        blank=True,
        related_name="related_continuations"
    )

    def __str__(self):
        return self.title
