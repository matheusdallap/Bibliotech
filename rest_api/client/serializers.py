from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

Customer = get_user_model()

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "username", "email", "first_name", "last_name", "is_active", "is_staff", "date_joined"]
        read_only_fields = ["id", "is_staff", "date_joined"]

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=Customer.objects.all(), message="Este email já está cadastrado.")]
    )
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={'min_length': 'A senha deve ter no mínimo 6 caracteres.'}
    )
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = Customer
        fields = ["id", "username", "email", "password", "first_name", "last_name"]

    def create(self, validated_data):
        return Customer.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
            first_name=validated_data.get("first_name"),
            last_name=validated_data.get("last_name")
        )

# O LoginSerializer continua igual
class CustomLoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['first_name'] = self.user.first_name
        data['is_admin'] = self.user.is_staff 
        return data