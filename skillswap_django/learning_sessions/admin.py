from django.contrib import admin
from .models import LearningSession


@admin.register(LearningSession)
class LearningSessionAdmin(admin.ModelAdmin):
    list_display = ['skill', 'learner', 'mentor', 'scheduled_datetime', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['skill__title', 'learner__user__username', 'mentor__user__username']
