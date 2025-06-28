from django.db import models
from django.contrib.auth.models import User
from accounts.models import UserProfile


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"


class Skill(models.Model):
    SKILL_LEVELS = (
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    )
    
    mentor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='skills_offered')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    level = models.CharField(max_length=15, choices=SKILL_LEVELS, default='BEGINNER')
    duration_minutes = models.IntegerField(help_text="Typical session duration in minutes")
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} by {self.mentor.user.username}"
