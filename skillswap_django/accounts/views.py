from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import RegisterSerializer, UserProfileSerializer


class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(profile.user)
        
        response_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(profile).data
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(username=request.data['username'])
            profile_data = UserProfileSerializer(user.userprofile).data
            response.data['user'] = profile_data
        return response


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    try:
        profile = request.user.userprofile
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
