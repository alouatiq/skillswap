from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import LearningSession

@shared_task
def send_booking_confirmation_email(session_id):
    """Send booking confirmation email when session is approved"""
    try:
        session = LearningSession.objects.get(id=session_id)
        
        subject = f'Session Approved: {session.skill.title}'
        message = f"""
Hi {session.learner.user.first_name},

Great news! Your learning session has been approved.

Session Details:
- Skill: {session.skill.title}
- Mentor: {session.mentor.user.first_name} {session.mentor.user.last_name}
- Date & Time: {session.scheduled_datetime.strftime('%B %d, %Y at %I:%M %p')}
- Duration: {session.skill.duration_minutes} minutes

Mentor's Response: {session.mentor_response or 'Looking forward to our session!'}

Best regards,
The SkillSwap Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@skillswap.com',
            [session.learner.user.email],
            fail_silently=False,
        )
        
        return f"Booking confirmation sent to {session.learner.user.email}"
        
    except LearningSession.DoesNotExist:
        return f"Session {session_id} not found"
    except Exception as e:
        return f"Error sending email: {str(e)}"

@shared_task
def send_session_reminder_email(session_id):
    """Send reminder email 30 minutes before session"""
    try:
        session = LearningSession.objects.get(id=session_id)
        
        if session.status != 'APPROVED':
            return f"Session {session_id} is not approved, skipping reminder"
        
        subject = f'Session Reminder: {session.skill.title} in 30 minutes'
        message = f"""
Hi {session.learner.user.first_name},

This is a friendly reminder that your learning session starts in 30 minutes.

Session Details:
- Skill: {session.skill.title}
- Mentor: {session.mentor.user.first_name} {session.mentor.user.last_name}
- Time: {session.scheduled_datetime.strftime('%I:%M %p')}
- Duration: {session.skill.duration_minutes} minutes

Please be ready to start on time. If you need to reschedule or cancel, please contact your mentor as soon as possible.

Best regards,
The SkillSwap Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@skillswap.com',
            [session.learner.user.email],
            fail_silently=False,
        )
        
        return f"Reminder sent to {session.learner.user.email}"
        
    except LearningSession.DoesNotExist:
        return f"Session {session_id} not found"
    except Exception as e:
        return f"Error sending reminder: {str(e)}"

@shared_task
def schedule_session_reminders():
    """Check for sessions starting in 30 minutes and send reminders"""
    now = timezone.now()
    reminder_time = now + timedelta(minutes=30)
    
    sessions = LearningSession.objects.filter(
        status='APPROVED',
        scheduled_datetime__gte=reminder_time - timedelta(minutes=2),
        scheduled_datetime__lte=reminder_time + timedelta(minutes=2)
    )
    
    count = 0
    for session in sessions:
        send_session_reminder_email.delay(session.id)
        count += 1
    
    return f"Scheduled {count} reminder emails"
