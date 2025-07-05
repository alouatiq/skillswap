# SkillSwap - Peer Learning Web Application

A full-stack web application that allows users to register as mentors or learners, list/browse skills, book 1-on-1 learning sessions, receive email notifications, and leave reviews.

## Features

### Core Functionality
- **User Authentication**: JWT-based registration/login with LEARNER and MENTOR roles
- **Skill Management**: Mentors can create/edit skills with categories, levels, and descriptions
- **Session Booking**: Learners can book 1-on-1 sessions with mentors
- **Dashboard**: Role-specific views showing upcoming sessions and pending requests
- **Email Notifications**: Celery tasks for booking confirmations and 30-minute reminders
- **Reviews System**: Post-session ratings and feedback

### Technical Stack
- **Backend**: Django 5.2.3 + Django REST Framework + JWT Authentication
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Database**: SQLite (development) / PostgreSQL (production)
- **Background Tasks**: Celery with Redis
- **Email**: Console backend (development) / SendGrid (production)

## Setup Instructions

### Prerequisites
- Python 3.12+
- Node.js 18+
- Redis (for Celery background tasks)

### Backend Setup (Django)

1. Navigate to the Django backend directory:
   ```bash
   cd skillswap_django
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

6. Start the Django development server:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

The backend API will be available at `http://localhost:8000/`

### Frontend Setup (React)

1. Navigate to the React frontend directory:
   ```bash
   cd skillswap_frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173/`

### Celery Setup (Background Tasks)

1. Make sure Redis is running on your system:
   ```bash
   redis-server
   ```

2. In a new terminal, navigate to the Django backend directory and start Celery worker:
   ```bash
   cd skillswap_django
   celery -A skillswap_backend worker --loglevel=info
   ```

3. In another terminal, start Celery beat scheduler (for periodic tasks):
   ```bash
   cd skillswap_django
   celery -A skillswap_backend beat --loglevel=info
   ```

## Usage

1. **Registration**: Visit `http://localhost:5173/register` to create an account
   - Choose between LEARNER or MENTOR role during registration

2. **Login**: Visit `http://localhost:5173/login` to sign in

3. **For Mentors**:
   - Access dashboard to manage skills and session requests
   - Create new skills via "Add Skill" button
   - Approve/reject session requests from learners

4. **For Learners**:
   - Browse available skills at `http://localhost:5173/skills`
   - Filter by category, level, or search terms
   - Book sessions with mentors
   - View upcoming sessions in dashboard

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Refresh JWT token

### Skills
- `GET /api/skills/` - List all skills
- `POST /api/skills/` - Create new skill (mentors only)
- `GET /api/skills/{id}/` - Get skill details
- `PUT /api/skills/{id}/` - Update skill (owner only)

### Learning Sessions
- `GET /api/sessions/` - List user's sessions
- `POST /api/sessions/` - Book new session
- `POST /api/sessions/{id}/approve/` - Approve session (mentor only)
- `POST /api/sessions/{id}/reject/` - Reject session (mentor only)

### User Profiles
- `GET /api/auth/profile/` - Get current user profile
- `PUT /api/auth/profile/` - Update user profile

## Configuration

### Environment Variables

**Backend (.env in skillswap_django/):**
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

**Frontend (.env in skillswap_frontend/):**
```
VITE_API_URL=http://localhost:8000/api
```

## Production Deployment

### Backend (Render/Heroku)
1. Update `ALLOWED_HOSTS` in settings.py
2. Set `DEBUG=False`
3. Configure PostgreSQL database
4. Set up Redis for Celery
5. Configure email service (SendGrid/Mailtrap)

### Frontend (Netlify/Vercel)
1. Build the production version: `npm run build`
2. Update `VITE_API_URL` to production backend URL
3. Deploy the `dist/` directory

## Development Notes

- The application uses SQLite for development (data will be lost on restart)
- Email notifications are printed to console in development mode
- JWT tokens expire after 60 minutes (configurable in settings.py)
- Celery beat checks for session reminders every 5 minutes

## Troubleshooting

1. **CORS Issues**: Make sure the frontend URL is in `CORS_ALLOWED_ORIGINS` in Django settings
2. **Database Issues**: Run `python manage.py migrate` to apply migrations
3. **JWT Issues**: Check token expiration and refresh logic
4. **Celery Issues**: Ensure Redis is running and accessible

## Support

For issues or questions, check the Django and React documentation:
- Django: https://docs.djangoproject.com/
- React: https://react.dev/
- Django REST Framework: https://www.django-rest-framework.org/
