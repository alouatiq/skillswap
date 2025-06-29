from django.db import models
from django.contrib.auth.models import User
from accounts.models import UserProfile
from skills.models import Skill


class LearningSession(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    learner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='learning_sessions')
    mentor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='teaching_sessions')
    scheduled_datetime = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    learner_message = models.TextField(blank=True, help_text="Message from learner to mentor")
    mentor_response = models.TextField(blank=True, help_text="Response from mentor")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.skill.title} - {self.learner.user.username} with {self.mentor.user.username}"


class SessionMessage(models.Model):
    session = models.ForeignKey(LearningSession, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.user.username} in session {self.session.id}"
