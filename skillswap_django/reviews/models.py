from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import UserProfile
from learning_sessions.models import LearningSession


class Review(models.Model):
    session = models.ForeignKey(LearningSession, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='reviews_given')
    reviewed = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('session', 'reviewer', 'reviewed')

    def __str__(self):
        return f"Review by {self.reviewer.user.username} for {self.reviewed.user.username} - {self.rating} stars"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        reviews = Review.objects.filter(reviewed=self.reviewed)
        self.reviewed.average_rating = reviews.aggregate(models.Avg('rating'))['rating__avg'] or 0.0
        self.reviewed.review_count = reviews.count()
        self.reviewed.save()
