from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Author, Publisher, Book, Comment


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ["id", "name"]


class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = ["id", "name"]


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    book = serializers.ReadOnlyField(source='book.title')

    class Meta:
        model = Comment
        fields = ["id", "user", "book", "text", "created_at"]
        read_only_fields = ["user", "book", "created_at"]


class BookSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    publisher = PublisherSerializer(read_only=True)

    comments = CommentSerializer(many=True, read_only=True)

    author_name = serializers.CharField(write_only=True, required=False, allow_null=True)
    publisher_name = serializers.CharField(write_only=True, required=False, allow_null=True)
    
    short_description = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "description",
            "short_description",
            "genre",
            "page_count",
            "publication_date",
            "image",
            "author",
            "publisher",
            "author_name",
            "publisher_name",
            "continuation",
            "comments",
        ]

    def get_short_description(self, obj):
        if not obj.description:
            return ""
        if len(obj.description) > 200:
            return obj.description[:200] + "..."
        return obj.description

    def create(self, validated_data):
        author_name = validated_data.pop("author_name", None)
        publisher_name = validated_data.pop("publisher_name", None)

        continuation = validated_data.pop("continuation", [])

        book = Book.objects.create(**validated_data)

        if author_name:
            author_obj, _ = Author.objects.get_or_create(name=author_name)
            book.author = author_obj

        if publisher_name:
            publisher_obj, _ = Publisher.objects.get_or_create(name=publisher_name)
            book.publisher = publisher_obj

        book.save()
        if continuation:
            book.continuation.set(continuation)

        return book
