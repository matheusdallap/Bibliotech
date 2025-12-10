from rest_framework import serializers
from .models import Author, Publisher, Book

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ["id", "name"]

class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = ["id", "name"]

class BookSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    publisher = PublisherSerializer(read_only=True)

    author_id = serializers.PrimaryKeyRelatedField(
        queryset=Author.objects.all(), source="author", write_only=True
    )
    publisher_id = serializers.PrimaryKeyRelatedField(
        queryset=Publisher.objects.all(), source="publisher", write_only=True, allow_null=True
    )

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "description",
            "image",
            "author",
            "publisher",
            "author_id",
            "publisher_id",
            "continuation",
        ]
