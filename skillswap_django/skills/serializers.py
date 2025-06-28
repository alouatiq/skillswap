from rest_framework import serializers
from .models import Category, Skill
from accounts.serializers import UserProfileSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon']


class SkillSerializer(serializers.ModelSerializer):
    mentor = UserProfileSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Skill
        fields = ['id', 'mentor', 'category', 'category_name', 'title', 'description', 
                 'level', 'duration_minutes', 'tags', 'created_at', 'updated_at']
        read_only_fields = ['mentor']

    def create(self, validated_data):
        validated_data['mentor'] = self.context['request'].user.userprofile
        return super().create(validated_data)
