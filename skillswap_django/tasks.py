from celery import Celery
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta
from sessions.models import LearningSession

app = Celery('skillswap')
app.config_from_object('django.conf:settings', namespace='CELERY')

@app.task
def send_booking_confirmation_email(session_id):
    try:
        session = LearningSession.objects.get(id=session_id)
        subject = f'SkillSwap: Session Confirmed - {session.skill.title}'
        message = f'''
        Hi {session.learner.user.first_name or session.learner.user.username},
        
        Your learning session has been confirmed!
        
        Skill: {session.skill.title}
        Mentor: {session.mentor.user.first_name or session.mentor.user.username}
        Date & Time: {session.scheduled_datetime.strftime('%B %d, %Y at %I:%M %p')}
        Duration: {session.skill.duration_minutes} minutes
        
        Best regards,
        SkillSwap Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [session.learner.user.email],
            fail_silently=False,
        )
    except LearningSession.DoesNotExist:
        pass

@app.task
def send_session_reminder_email(session_id):
    try:
        session = LearningSession.objects.get(id=session_id)
        if session.status != 'APPROVED':
            return
            
        subject = f'SkillSwap: Session Reminder - {session.skill.title}'
        message = f'''
        Hi {session.learner.user.first_name or session.learner.user.username},
        
        This is a reminder that your learning session starts in 30 minutes!
        
        Skill: {session.skill.title}
        Mentor: {session.mentor.user.first_name or session.mentor.user.username}
        Date & Time: {session.scheduled_datetime.strftime('%B %d, %Y at %I:%M %p')}
        
        Best regards,
        SkillSwap Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [session.learner.user.email],
            fail_silently=False,
        )
    except LearningSession.DoesNotExist:
        pass

@app.task
def schedule_session_reminders():
    reminder_time = datetime.now() + timedelta(minutes=30)
    upcoming_sessions = LearningSession.objects.filter(
        scheduled_datetime__lte=reminder_time,
        scheduled_datetime__gte=datetime.now(),
        status='APPROVED'
    )
    
    for session in upcoming_sessions:
        send_session_reminder_email.delay(session.id)
