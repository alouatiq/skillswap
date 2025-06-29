from django.contrib import admin
from .models import Review
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import models

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['session', 'reviewer', 'reviewed', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['reviewer__user__username', 'reviewed__user__username']
