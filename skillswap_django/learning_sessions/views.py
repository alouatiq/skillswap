from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from django.utils import timezone
from .models import LearningSession, SessionMessage
from .serializers import LearningSessionSerializer, SessionMessageSerializer


class LearningSessionViewSet(viewsets.ModelViewSet):
    queryset = LearningSession.objects.all()
    serializer_class = LearningSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user.userprofile
        return LearningSession.objects.filter(
            models.Q(learner=user_profile) | models.Q(mentor=user_profile)
        ).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def as_learner(self, request):
        sessions = LearningSession.objects.filter(learner=request.user.userprofile)
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def as_mentor(self, request):
        sessions = LearningSession.objects.filter(mentor=request.user.userprofile)
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        session = self.get_object()
        if session.mentor != request.user.userprofile:
            return Response({'error': 'Only the mentor can approve sessions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        session.status = 'APPROVED'
        session.mentor_response = request.data.get('mentor_response', '')
        session.save()
        
        # from .tasks import send_booking_confirmation_email
        # send_booking_confirmation_email.delay(session.id)
        
        serializer = self.get_serializer(session)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        session = self.get_object()
        if session.mentor != request.user.userprofile:
            return Response({'error': 'Only the mentor can reject sessions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        session.status = 'REJECTED'
        session.mentor_response = request.data.get('mentor_response', '')
        session.save()
        
        serializer = self.get_serializer(session)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def edit_time(self, request, pk=None):
        session = self.get_object()
        user_profile = request.user.userprofile
        
        if session.learner != user_profile and session.mentor != user_profile:
            return Response({'error': 'Only session participants can edit time'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        new_datetime = request.data.get('scheduled_datetime')
        if not new_datetime:
            return Response({'error': 'scheduled_datetime is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        session.scheduled_datetime = new_datetime
        if session.status == 'APPROVED':
            session.status = 'PENDING'
        session.save()
        
        serializer = self.get_serializer(session)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        session = self.get_object()
        user_profile = request.user.userprofile
        
        if session.learner != user_profile and session.mentor != user_profile:
            return Response({'error': 'Only session participants can access messages'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            messages = session.messages.all()
            serializer = SessionMessageSerializer(messages, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            message_text = request.data.get('message')
            if not message_text:
                return Response({'error': 'Message is required'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            message = SessionMessage.objects.create(
                session=session,
                sender=user_profile,
                message=message_text
            )
            serializer = SessionMessageSerializer(message)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        session = self.get_object()
        user_profile = request.user.userprofile
        
        if session.learner != user_profile and session.mentor != user_profile:
            return Response({'error': 'Only session participants can mark as complete'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        session.status = 'COMPLETED'
        session.save()
        
        serializer = self.get_serializer(session)
        return Response(serializer.data)
