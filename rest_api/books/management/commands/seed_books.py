import os
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from books.models import Book, Author, Publisher

class Command(BaseCommand):
    help = 'Popula o banco de dados com livros iniciais'

    def handle(self, *args, **kwargs):
        self.stdout.write('Iniciando o seed de livros...')
        books_data = [
            {
                "title": "Dom Casmurro",
                "author": "Machado de Assis",
                "publisher": "Editora Garnier",
                "genre": "Romance",
                "page_count": 256,
                "description": "Bentinho e Capitu. Traiu ou não traiu?",
                "image_filename": "dom_casmurro.jpg",
                "quantity": 5
            },
            {
                "title": "O Senhor dos Anéis: A Sociedade do Anel",
                "author": "J.R.R. Tolkien",
                "publisher": "Martins Fontes",
                "genre": "Fantasia",
                "page_count": 576,
                "description": "Um anel para a todos governar...",
                "image_filename": "senhor_aneis.jpg",
                "quantity": 3
            },
            {
                "title": "1984",
                "author": "George Orwell",
                "publisher": "Companhia das Letras",
                "genre": "Distopia",
                "page_count": 416,
                "description": "O Grande Irmão está de olho em você.",
                "image_filename": "1984.jpg",
                "quantity": 10
            },
            {
                "title": "O Pequeno Príncipe",
                "author": "Antoine de Saint-Exupéry",
                "publisher": "Agir",
                "genre": "Infantil / Filosófico",
                "page_count": 96,
                "description": "O essencial é invisível aos olhos.",
                "image_filename": "pequeno_principe.jpg",
                "quantity": 7
            },
            {
                "title": "Harry Potter e a Pedra Filosofal",
                "author": "J.K. Rowling",
                "publisher": "Rocco",
                "genre": "Fantasia",
                "page_count": 223,
                "description": "O menino que sobreviveu.",
                "image_filename": "harry_potter.jpg",
                "quantity": 4
            },
        ]

        base_path = os.path.join(settings.BASE_DIR, 'initial_data')

        for item in books_data:
            if Book.objects.filter(title=item["title"]).exists():
                self.stdout.write(self.style.WARNING(f'Livro "{item["title"]}" já existe. Pulando...'))
                continue

            # Cria ou Pega Autor e Editora
            author, _ = Author.objects.get_or_create(name=item["author"])
            publisher, _ = Publisher.objects.get_or_create(name=item["publisher"])

            # Cria o objeto Book (sem salvar ainda)
            book = Book(
                title=item["title"],
                author=author,
                publisher=publisher,
                genre=item["genre"],
                page_count=item["page_count"],
                description=item["description"],
                quantity=item["quantity"]
            )

            # Tenta anexar a imagem
            image_path = os.path.join(base_path, item["image_filename"])
            if os.path.exists(image_path):
                with open(image_path, 'rb') as img_file:
                    book.image.save(item["image_filename"], File(img_file), save=False)
                    self.stdout.write(f'Imagem {item["image_filename"]} carregada.')
            else:
                self.stdout.write(self.style.ERROR(f'Imagem não encontrada: {image_path}'))

            # Salva o livro no banco
            book.save()
            self.stdout.write(self.style.SUCCESS(f'Livro "{item["title"]}" criado com sucesso!'))

        self.stdout.write(self.style.SUCCESS('Seed finalizado!'))