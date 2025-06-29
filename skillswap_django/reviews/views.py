from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import models
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user.userprofile
        user_id = self.request.query_params.get('user_id')
        
        if user_id:
            return Review.objects.filter(reviewed__id=user_id).order_by('-created_at')
        
        return Review.objects.filter(
            models.Q(reviewer=user_profile) | models.Q(reviewed=user_profile)
        ).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        print(f"DEBUG: ReviewViewSet.create called")
        print(f"DEBUG: request.data: {request.data}")
        print(f"DEBUG: request.user: {request.user}")
        print(f"DEBUG: request.user.is_authenticated: {request.user.is_authenticated}")
        print(f"DEBUG: request.content_type: {request.content_type}")
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"DEBUG: Exception in create: {e}")
            print(f"DEBUG: Exception type: {type(e)}")
            import traceback
            print(f"DEBUG: Traceback: {traceback.format_exc()}")
            raise

    def perform_create(self, serializer):
        print(f"DEBUG: perform_create called with data: {self.request.data}")
        print(f"DEBUG: user: {self.request.user}")
        print(f"DEBUG: serializer.validated_data: {serializer.validated_data}")
        serializer.save()
    
    def perform_update(self, serializer):
        review = self.get_object()
        if review.reviewer != self.request.user.userprofile:
            raise PermissionDenied("You can only edit your own reviews")
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.reviewer != self.request.user.userprofile:
            raise PermissionDenied("You can only delete your own reviews")
        instance.delete()

    @action(detail=False, methods=['get'])
    def for_user(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id parameter is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        reviews = Review.objects.filter(reviewed__id=user_id).order_by('-created_at')
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
