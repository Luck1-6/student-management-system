from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .serializers import LoginSerializer, ProfileSerializer
from .models import AuditLog


def get_client_ip(request):
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    return x_forwarded.split(',')[0] if x_forwarded else request.META.get('REMOTE_ADDR')


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(description="JWT access + refresh tokens with user profile"),
            401: OpenApiResponse(description="Invalid credentials"),
        },
        summary="User Login",
        tags=["Authentication"],
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            AuditLog.objects.create(
                action='FAILED_LOGIN',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                extra_data={'email': request.data.get('email')}
            )
            return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        # Inject role into token claims
        refresh['role'] = user.role
        refresh['full_name'] = user.get_full_name()

        AuditLog.objects.create(
            user=user, action='LOGIN',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user':    ProfileSerializer(user).data,
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request={'application/json': {'type': 'object',
                  'properties': {'refresh': {'type': 'string'}},
                  'required': ['refresh']}},
        responses={205: OpenApiResponse(description="Successfully logged out")},
        summary="User Logout",
        tags=["Authentication"],
    )
    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()           # Invalidates token in DB
        except TokenError:
            return Response({'detail': 'Invalid or expired token.'},
                            status=status.HTTP_400_BAD_REQUEST)

        AuditLog.objects.create(
            user=request.user, action='LOGOUT',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response({'detail': 'Successfully logged out.'},
                        status=status.HTTP_205_RESET_CONTENT)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: ProfileSerializer},
        summary="Get current user profile",
        tags=["Authentication"],
    )
    def get(self, request):
        return Response(ProfileSerializer(request.user).data)