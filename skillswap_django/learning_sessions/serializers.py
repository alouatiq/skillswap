from rest_framework import serializers
from .models import LearningSession, SessionMessage
from accounts.serializers import UserProfileSerializer
from skills.serializers import SkillSerializer


class LearningSessionSerializer(serializers.ModelSerializer):
    learner = UserProfileSerializer(read_only=True)
    mentor = UserProfileSerializer(read_only=True)
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.IntegerField(write_only=True)
    skill_title = serializers.CharField(source='skill.title', read_only=True)
    
    class Meta:
        model = LearningSession
        fields = ['id', 'skill', 'skill_id', 'skill_title', 'learner', 'mentor', 'scheduled_datetime', 
                 'status', 'learner_message', 'mentor_response', 'created_at', 'updated_at']
        read_only_fields = ['learner', 'mentor']

    def create(self, validated_data):
        from skills.models import Skill
        skill_id = validated_data.pop('skill_id')
        skill = Skill.objects.get(id=skill_id)
        validated_data['skill'] = skill
        validated_data['learner'] = self.context['request'].user.userprofile
        validated_data['mentor'] = skill.mentor
        return super().create(validated_data)


class SessionMessageSerializer(serializers.ModelSerializer):
    sender = UserProfileSerializer(read_only=True)
    sender_name = serializers.CharField(source='sender.user.get_full_name', read_only=True)

    class Meta:
        model = SessionMessage
        fields = ['id', 'session', 'sender', 'sender_name', 'message', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']
