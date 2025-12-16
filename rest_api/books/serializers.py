from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Author, Publisher, Book, Comment, Rating, Favorite
from django.db.models import Avg


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
    user_rating = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "user", "book", "text", "created_at", "user_rating"]
        read_only_fields = ["user", "book", "created_at"]

    def get_user_rating(self, obj):
        rating = Rating.objects.filter(user=obj.user, book=obj.book).first()
        
        if rating:
            return rating.stars
        return None

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['stars']

class BookSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    publisher = PublisherSerializer(read_only=True)

    comments = CommentSerializer(many=True, read_only=True)

    author_name = serializers.CharField(write_only=True, required=False, allow_null=True)
    publisher_name = serializers.CharField(write_only=True, required=False, allow_null=True)
    
    short_description = serializers.SerializerMethodField()

    average_rating = serializers.SerializerMethodField()
    my_rating = serializers.SerializerMethodField()

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
            "average_rating",
            "my_rating"
        ]

    def get_short_description(self, obj):
        if not obj.description:
            return ""
        if len(obj.description) > 200:
            return obj.description[:200] + "..."
        return obj.description

    def get_average_rating(self, obj):
        average = obj.ratings.aggregate(Avg('stars')).get('stars__avg')
        if average:
            return round(average, 1)
        return 0

    def get_my_rating(self, obj):
        user = self.context.get('request').user
        
        if user.is_anonymous:
            return None
            
        rating = obj.ratings.filter(user=user).first()
        if rating:
            return rating.stars
        return None

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


class BookSummarySerializer(serializers.ModelSerializer):
    """
    Versão leve do livro para listagens (Favoritos, Home, etc).
    SEM comentários, SEM descrição longa, SEM editora.
    """
    author = AuthorSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField() # Mantemos a nota pq é legal ver na lista

    class Meta:
        model = Book
        fields = [
            "id", 
            "title", 
            "image",
            "author", 
            "average_rating"
        ]

    def get_average_rating(self, obj):
        average = obj.ratings.aggregate(Avg('stars')).get('stars__avg')
        if average:
            return round(average, 1)
        return 0

class FavoriteSerializer(serializers.ModelSerializer):
    book = BookSummarySerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'book', 'added_at']
