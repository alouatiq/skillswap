from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LearningSessionViewSet

router = DefaultRouter()
router.register(r'sessions', LearningSessionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
