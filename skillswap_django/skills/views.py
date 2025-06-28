from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Category, Skill
from .serializers import CategorySerializer, SkillSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Skill.objects.all()
        category = self.request.query_params.get('category', None)
        level = self.request.query_params.get('level', None)
        
        if category:
            queryset = queryset.filter(category_id=category)
        if level:
            queryset = queryset.filter(level=level)
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(mentor=self.request.user.userprofile)
    
    def perform_update(self, serializer):
        skill = self.get_object()
        if skill.mentor != self.request.user.userprofile:
            raise PermissionDenied("You can only edit your own skills")
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.mentor != self.request.user.userprofile:
            raise PermissionDenied("You can only delete your own skills")
        instance.delete()

    @action(detail=False, methods=['get'])
    def my_skills(self, request):
        skills = Skill.objects.filter(mentor=request.user.userprofile)
        serializer = self.get_serializer(skills, many=True)
        return Response(serializer.data)
