from rest_framework import serializers
from .models import Review
from accounts.serializers import UserProfileSerializer
from learning_sessions.models import LearningSession


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserProfileSerializer(read_only=True)
    reviewed = UserProfileSerializer(read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.user.get_full_name', read_only=True)
    session_id = serializers.IntegerField(write_only=True)
    reviewed_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Review
        fields = ['id', 'session', 'session_id', 'reviewer', 'reviewed', 'reviewed_id', 'reviewer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'session', 'reviewer', 'reviewed', 'created_at']

    def create(self, validated_data):
        print(f"DEBUG: validated_data = {validated_data}")
        session_id = validated_data.pop('session_id')
        reviewed_id = validated_data.pop('reviewed_id', None)
        print(f"DEBUG: session_id = {session_id}, reviewed_id = {reviewed_id}")
        
        try:
            session = LearningSession.objects.get(id=session_id)
            print(f"DEBUG: session found = {session}, status = {session.status}")
        except LearningSession.DoesNotExist:
            raise serializers.ValidationError("Session not found")
        
        if session.status != 'COMPLETED':
            raise serializers.ValidationError("Can only review completed sessions")
        
        reviewer = self.context['request'].user.userprofile
        print(f"DEBUG: reviewer = {reviewer}")
        
        if reviewed_id:
            from accounts.models import UserProfile
            try:
                reviewed = UserProfile.objects.get(id=reviewed_id)
                print(f"DEBUG: reviewed user found = {reviewed}")
            except UserProfile.DoesNotExist:
                raise serializers.ValidationError("Reviewed user not found")
            if reviewed not in [session.learner, session.mentor]:
                raise serializers.ValidationError("Can only review participants of this session")
        else:
            if session.learner == reviewer:
                reviewed = session.mentor
            elif session.mentor == reviewer:
                reviewed = session.learner
            else:
                raise serializers.ValidationError("You can only review sessions you participated in")
        
        if reviewer not in [session.learner, session.mentor]:
            raise serializers.ValidationError("You can only review sessions you participated in")
        
        print(f"DEBUG: Creating review with session={session}, reviewer={reviewer}, reviewed={reviewed}, data={validated_data}")
        
        return Review.objects.create(
            session=session,
            reviewer=reviewer,
            reviewed=reviewed,
            **validated_data
        )
