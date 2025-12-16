import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from books.models import Author, Publisher

def populate():
    author, created_a = Author.objects.get_or_create(
        name="J.R.R. Tolkien"
    )
    if created_a:
        print(f"Autor criado: {author.name} (ID: {author.id})")
    else:
        print(f"Autor já existe: {author.name} (ID: {author.id})")

    publisher, created_p = Publisher.objects.get_or_create(
        name="HarperCollins"
    )
    if created_p:
        print(f"Editora criada: {publisher.name} (ID: {publisher.id})")
    else:
        print(f"Editora já existe: {publisher.name} (ID: {publisher.id})")

if __name__ == "__main__":
    populate()