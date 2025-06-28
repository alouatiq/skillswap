from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'user_type', 'bio', 'profile_image', 'timezone', 
                 'average_rating', 'review_count', 'created_at', 'updated_at']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=UserProfile.USER_TYPES)
    bio = serializers.CharField(required=False, allow_blank=True)
    timezone = serializers.CharField(required=False, default='UTC')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        user_type = validated_data.pop('user_type')
        bio = validated_data.pop('bio', '')
        timezone = validated_data.pop('timezone', 'UTC')
        validated_data.pop('password_confirm')
        
        user = User.objects.create_user(**validated_data)
        profile = UserProfile.objects.create(
            user=user,
            user_type=user_type,
            bio=bio,
            timezone=timezone
        )
        return profile
