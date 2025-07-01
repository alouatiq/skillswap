from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import RegisterView, CustomTokenObtainPairView, profile_view
from skills.views import CategoryViewSet, SkillViewSet
from learning_sessions.views import LearningSessionViewSet
from reviews.views import ReviewViewSet
from django.http import JsonResponse

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'sessions', LearningSessionViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path("", lambda request: JsonResponse({"message": "SkillSwap API is live!"})),
    path('admin/', admin.site.urls),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/profile/', profile_view, name='profile'),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
