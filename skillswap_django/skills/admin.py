from django.contrib import admin
from .models import Category, Skill


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['title', 'mentor', 'category', 'level', 'duration_minutes', 'created_at']
    list_filter = ['category', 'level', 'created_at']
    search_fields = ['title', 'mentor__user__username']
