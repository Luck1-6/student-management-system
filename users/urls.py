from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/',   views.LoginView.as_view(),  name='auth-login'),
    path('logout/',  views.LogoutView.as_view(), name='auth-logout'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('me/',      views.MeView.as_view(),     name='auth-me'),
]
