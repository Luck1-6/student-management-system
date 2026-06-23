# Student Management System — Authentication Module
## Full-Stack Implementation Plan
### Stack: PostgreSQL · Django REST · React JS · Bootstrap

---

## 1. SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                        ACTORS / ROLES                           │
│                                                                 │
│   👨‍🎓 Student        👩‍🏫 Staff           👨‍💼 Admin              │
│   (read-only)      (CRUD students)    (full access)            │
└─────────────────────────────────────────────────────────────────┘
          │                  │                   │
          ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   React JS Frontend                             │
│   Login Page → Role-based Dashboard → Protected Routes          │
│   Bootstrap 5 · Axios · React Router · JWT storage             │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTPS REST API calls
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               Django REST Framework Backend                     │
│   /api/auth/login  /api/auth/logout  /api/auth/refresh          │
│   SimpleJWT · Custom User Model · Permission Classes            │
│   Swagger / OpenAPI docs at /api/docs/                          │
└────────────────────────────┬────────────────────────────────────┘
                             │  Django ORM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                         │
│   users_customuser · auth_tokens · audit_logs                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. DATABASE LAYER — PostgreSQL

### 2.1 Custom User Model

```sql
-- Table: users_customuser
CREATE TABLE users_customuser (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(254) NOT NULL UNIQUE,
    username        VARCHAR(150) NOT NULL UNIQUE,
    first_name      VARCHAR(150) NOT NULL,
    last_name       VARCHAR(150) NOT NULL,
    role            VARCHAR(10)  NOT NULL CHECK (role IN ('student','staff','admin')),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_staff        BOOLEAN      NOT NULL DEFAULT FALSE,
    is_superuser    BOOLEAN      NOT NULL DEFAULT FALSE,
    date_joined     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_login      TIMESTAMPTZ,
    profile_picture VARCHAR(255),
    phone_number    VARCHAR(20),
    password        VARCHAR(128) NOT NULL   -- bcrypt hash stored by Django
);

-- Index for fast lookup on email and role
CREATE INDEX idx_customuser_email ON users_customuser(email);
CREATE INDEX idx_customuser_role  ON users_customuser(role);
```

### 2.2 JWT Token Blacklist (djangorestframework-simplejwt)

```sql
-- Managed automatically by simplejwt
-- token_blacklist_outstandingtoken  → tracks issued JWTs
-- token_blacklist_blacklistedtoken  → revoked tokens (logout)
```

### 2.3 Audit Log

```sql
CREATE TABLE users_auditlog (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users_customuser(id) ON DELETE SET NULL,
    action      VARCHAR(50)  NOT NULL,  -- 'LOGIN', 'LOGOUT', 'FAILED_LOGIN'
    ip_address  INET,
    user_agent  TEXT,
    timestamp   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    extra_data  JSONB
);

CREATE INDEX idx_auditlog_user_id  ON users_auditlog(user_id);
CREATE INDEX idx_auditlog_timestamp ON users_auditlog(timestamp DESC);
```

---

## 3. DJANGO BACKEND

### 3.1 Project Structure

```
sms_webservice/
├── manage.py
├── requirements.txt
├── .env
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── apps/
    └── users/
        ├── models.py          ← CustomUser, AuditLog
        ├── serializers.py     ← Login, Token, User serializers
        ├── views.py           ← LoginView, LogoutView, RefreshView, MeView
        ├── urls.py
        ├── permissions.py     ← IsAdmin, IsStaff, IsStudent
        ├── admin.py
        └── tests.py
```

### 3.2 requirements.txt

```
Django==5.0.6
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
drf-spectacular==0.27.2          # OpenAPI 3 / Swagger
psycopg2-binary==2.9.9
django-cors-headers==4.4.0
python-decouple==3.8
Pillow==10.4.0
```

### 3.3 Custom User Model — models.py

```python
# apps/users/models.py
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra)
        user.set_password(password)   # bcrypt hash
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra):
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        extra.setdefault('role', 'admin')
        return self.create_user(email, username, password, **extra)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('staff',   'Staff'),
        ('admin',   'Admin'),
    ]

    email         = models.EmailField(unique=True)
    username      = models.CharField(max_length=150, unique=True)
    first_name    = models.CharField(max_length=150)
    last_name     = models.CharField(max_length=150)
    role          = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    is_active     = models.BooleanField(default=True)
    is_staff      = models.BooleanField(default=False)
    date_joined   = models.DateTimeField(auto_now_add=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    phone_number  = models.CharField(max_length=20, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users_customuser'

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('FAILED_LOGIN', 'Failed Login'),
    ]
    user       = models.ForeignKey(CustomUser, null=True, on_delete=models.SET_NULL)
    action     = models.CharField(max_length=50, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    timestamp  = models.DateTimeField(auto_now_add=True)
    extra_data = models.JSONField(null=True, blank=True)

    class Meta:
        db_table  = 'users_auditlog'
        ordering  = ['-timestamp']
```

### 3.4 Serializers — serializers.py

```python
# apps/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser


class LoginSerializer(serializers.Serializer):
    """Validates email + password credentials."""
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Account is disabled.")
        data['user'] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model  = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name',
                  'full_name', 'role', 'profile_picture', 'phone_number',
                  'date_joined', 'last_login']
        read_only_fields = ['id', 'email', 'role', 'date_joined', 'last_login']
```

### 3.5 Views — views.py

```python
# apps/users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .serializers import LoginSerializer, UserProfileSerializer
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
        refresh['full_name'] = user.full_name

        AuditLog.objects.create(
            user=user, action='LOGIN',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user':    UserProfileSerializer(user).data,
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
        responses={200: UserProfileSerializer},
        summary="Get current user profile",
        tags=["Authentication"],
    )
    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)
```

### 3.6 URL Configuration

```python
# apps/users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/',   views.LoginView.as_view(),  name='auth-login'),
    path('logout/',  views.LogoutView.as_view(), name='auth-logout'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('me/',      views.MeView.as_view(),     name='auth-me'),
]

# sms_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/',         admin.site.urls),
    path('api/auth/',      include('apps.users.urls')),

    # OpenAPI / Swagger
    path('api/schema/',    SpectacularAPIView.as_view(),      name='schema'),
    path('api/docs/',      SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/',     SpectacularRedocView.as_view(url_name='schema'),   name='redoc'),
]
```

### 3.7 Django Settings (key auth sections)

```python
# settings/base.py  (key sections)
AUTH_USER_MODEL = 'users.CustomUser'

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'drf_spectacular',
    'corsheaders',
    'apps.users',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     config('DB_NAME'),
        'USER':     config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST':     config('DB_HOST', default='localhost'),
        'PORT':     config('DB_PORT', default='5432'),
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS':  True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES':      ('Bearer',),
    'TOKEN_OBTAIN_PAIR_SERIALIZER': None,  # using custom LoginView
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Student Management System API',
    'DESCRIPTION': 'Authentication and Management API for SMS',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",   # React dev server
]
```

---

## 4. REST API ENDPOINTS — Full Reference

```
Base URL: /api/auth/

┌─────────────────────────────────────────────────────────────────────────┐
│ Method │ Endpoint          │ Auth?  │ Description                       │
├────────┼───────────────────┼────────┼───────────────────────────────────┤
│ POST   │ /login/           │ No     │ Authenticate, receive JWT tokens  │
│ POST   │ /logout/          │ Yes    │ Blacklist refresh token           │
│ POST   │ /refresh/         │ No     │ Exchange refresh for new access   │
│ GET    │ /me/              │ Yes    │ Get authenticated user's profile  │
└─────────────────────────────────────────────────────────────────────────┘
```

### POST /api/auth/login/

**Request:**
```json
{
  "email": "student@sms.edu",
  "password": "SecurePass123"
}
```
**Response 200:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "student@sms.edu",
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "role": "student",
    "profile_picture": null,
    "date_joined": "2024-09-01T00:00:00Z"
  }
}
```
**Response 401:**
```json
{ "non_field_errors": ["Invalid credentials."] }
```

### POST /api/auth/logout/

**Header:** `Authorization: Bearer <access_token>`
**Request:**
```json
{ "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```
**Response 205:** `{ "detail": "Successfully logged out." }`

### POST /api/auth/refresh/

**Request:** `{ "refresh": "<refresh_token>" }`
**Response 200:** `{ "access": "<new_access_token>" }`

---

## 5. SWAGGER / OPENAPI DOCUMENTATION

### Access URLs

| UI        | URL                     | Description                        |
|-----------|-------------------------|------------------------------------|
| Swagger   | `http://localhost:8000/api/docs/`  | Interactive try-it-out UI |
| ReDoc     | `http://localhost:8000/api/redoc/` | Clean readable docs       |
| JSON Schema | `http://localhost:8000/api/schema/` | Raw OpenAPI 3.0 JSON    |

### Auto-generated via drf-spectacular
The `@extend_schema` decorator on each view populates:
- Request/response body schemas
- HTTP status codes and descriptions
- Tags grouping (Authentication)
- Summary and description fields

---

## 6. REACT JS FRONTEND

### 6.1 Project Structure

```
sms_frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   ├── axiosInstance.js      ← Base Axios config + interceptors
│   │   └── authApi.js            ← login(), logout(), getMe()
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── common/
│   │       ├── Navbar.jsx
│   │       └── LoadingSpinner.jsx
│   ├── context/
│   │   └── AuthContext.jsx       ← Global auth state (React Context)
│   ├── hooks/
│   │   └── useAuth.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── dashboards/
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── StaffDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   └── NotFoundPage.jsx
│   ├── utils/
│   │   └── tokenUtils.js         ← decode JWT, check expiry
│   ├── App.jsx
│   └── index.js
├── package.json
└── .env
```

### 6.2 package.json dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1",
    "axios": "^1.7.2",
    "bootstrap": "^5.3.3",
    "jwt-decode": "^4.0.0"
  }
}
```

### 6.3 Axios Instance + Interceptors — axiosInstance.js

```javascript
// src/api/axiosInstance.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ──────────────────────────
axiosInstance.interceptors.request.use((config) => {
  const access = localStorage.getItem('access_token');
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh/`, { refresh });
        localStorage.setItem('access_token', data.access);
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 6.4 Auth API — authApi.js

```javascript
// src/api/authApi.js
import axiosInstance from './axiosInstance';

export const loginApi = (email, password) =>
  axiosInstance.post('/api/auth/login/', { email, password });

export const logoutApi = (refresh) =>
  axiosInstance.post('/api/auth/logout/', { refresh });

export const getMeApi = () =>
  axiosInstance.get('/api/auth/me/');
```

### 6.5 Auth Context — AuthContext.jsx

```javascript
// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, logoutApi, getMeApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getMeApi()
        .then(res => setUser(res.data))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await loginApi(email, password);
    localStorage.setItem('access_token',  data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data.user);
    return data.user;         // caller uses role for redirect
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    try { await logoutApi(refresh); } catch { /* ignore */ }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 6.6 Protected Route — ProtectedRoute.jsx

```javascript
// src/components/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user)   return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
```

### 6.7 Login Page — LoginPage.jsx

```jsx
// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_DASHBOARDS = {
  student: '/dashboard/student',
  staff:   '/dashboard/staff',
  admin:   '/dashboard/admin',
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(ROLE_DASHBOARDS[user.role] || '/');
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0]
                  || err.response?.data?.detail
                  || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm" style={{ width: '420px' }}>
        <div className="card-body p-4">

          {/* Header */}
          <div className="text-center mb-4">
            <div className="bg-primary rounded-circle d-inline-flex
                            align-items-center justify-content-center mb-3"
                 style={{ width: 56, height: 56 }}>
              <i className="bi bi-mortarboard-fill text-white fs-4"></i>
            </div>
            <h4 className="fw-bold mb-1">Student Management System</h4>
            <p className="text-muted small">Sign in to your account</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="bi bi-exclamation-circle me-2"></i>{error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-medium">
                Email address
              </label>
              <input
                id="email" name="email" type="email"
                className="form-control"
                placeholder="you@university.edu"
                value={form.email}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-medium">
                Password
              </label>
              <input
                id="password" name="password" type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"/>Signing in…</>
                : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
```

### 6.8 App Router — App.jsx

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage          from './pages/LoginPage';
import StudentDashboard   from './pages/dashboards/StudentDashboard';
import StaffDashboard     from './pages/dashboards/StaffDashboard';
import AdminDashboard     from './pages/dashboards/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/staff" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

## 7. AUTHENTICATION FLOW — Sequence Diagram

```
Browser (React)              Django API              PostgreSQL
      │                           │                       │
      │  POST /api/auth/login/    │                       │
      │  { email, password }      │                       │
      │──────────────────────────>│                       │
      │                           │  SELECT * FROM        │
      │                           │  users_customuser     │
      │                           │  WHERE email=...      │
      │                           │──────────────────────>│
      │                           │  <── User record ─────│
      │                           │                       │
      │                           │  bcrypt verify()      │
      │                           │  INSERT auditlog      │
      │                           │──────────────────────>│
      │  200 { access, refresh,   │                       │
      │        user{role,...} }   │                       │
      │<──────────────────────────│                       │
      │                           │                       │
      │  Store tokens in          │                       │
      │  localStorage             │                       │
      │  Redirect → /dashboard/{role}                     │
      │                           │                       │
      │  GET /api/auth/me/        │                       │
      │  Authorization: Bearer... │                       │
      │──────────────────────────>│                       │
      │  200 { user profile }     │                       │
      │<──────────────────────────│                       │
      │                           │                       │
      │  [30 min later — access token expires]            │
      │                           │                       │
      │  POST /api/auth/refresh/  │                       │
      │  { refresh }              │                       │
      │──────────────────────────>│                       │
      │  200 { new access token } │                       │
      │<──────────────────────────│                       │
      │                           │                       │
      │  POST /api/auth/logout/   │                       │
      │  { refresh }              │                       │
      │──────────────────────────>│  INSERT blacklist     │
      │                           │──────────────────────>│
      │  205 Reset Content        │                       │
      │<──────────────────────────│                       │
      │  Clear localStorage       │                       │
      │  Redirect → /login        │                       │
```

---

## 8. ROLE-BASED ACCESS CONTROL MATRIX

```
┌─────────────────────────────┬─────────┬───────┬───────┐
│ Feature                     │ Student │ Staff │ Admin │
├─────────────────────────────┼─────────┼───────┼───────┤
│ Login / Logout              │   ✅   │  ✅  │  ✅  │
│ View own profile            │   ✅   │  ✅  │  ✅  │
│ View own grades             │   ✅   │  ❌  │  ✅  │
│ View student list           │   ❌   │  ✅  │  ✅  │
│ Create/Edit students        │   ❌   │  ✅  │  ✅  │
│ Delete students             │   ❌   │  ❌  │  ✅  │
│ Manage staff accounts       │   ❌   │  ❌  │  ✅  │
│ View audit logs             │   ❌   │  ❌  │  ✅  │
│ Access Django admin         │   ❌   │  ❌  │  ✅  │
└─────────────────────────────┴─────────┴───────┴───────┘
```

### Custom Permission Classes

```python
# apps/users/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsStaffRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('staff', 'admin')

class IsStudentRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'
```

---

## 9. SETUP COMMANDS — Quick Start

### Backend

```bash
# 1. Create & activate virtual environment
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup environment variables  (.env file)
DB_NAME=sms_db
DB_USER=sms_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-django-secret-key
DEBUG=True

# 4. Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE sms_db;"
psql -U postgres -c "CREATE USER sms_user WITH PASSWORD 'your_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sms_db TO sms_user;"

# 5. Run migrations
python manage.py makemigrations users
python manage.py migrate

# 6. Create superuser (admin)
python manage.py createsuperuser

# 7. Run development server
python manage.py runserver
```

### Frontend

```bash
# 1. Create React app
npx create-react-app sms_frontend
cd sms_frontend

# 2. Install dependencies
npm install react-router-dom axios bootstrap jwt-decode

# 3. Environment variable (.env)
REACT_APP_API_URL=http://localhost:8000

# 4. Start dev server
npm start
# → http://localhost:3000
```

---

## 10. SECURITY CHECKLIST

| Item | Implementation |
|------|---------------|
| Password hashing | Django bcrypt via `set_password()` |
| JWT short-lived access | 30-minute expiry |
| Token rotation | New refresh token on each refresh |
| Token blacklisting | Invalidated on logout via DB |
| Role injected into JWT | Custom claims: `role`, `full_name` |
| CORS restriction | Only `localhost:3000` in dev |
| HTTPS in production | Via nginx + Let's Encrypt |
| Rate limiting (recommended) | `django-ratelimit` on `/login/` |
| Audit logging | Every login/logout/failed attempt |
| Input validation | DRF serializer + Django validators |

---

## 11. SWAGGER UI PREVIEW

After running the backend, visit:
- **http://localhost:8000/api/docs/** — Swagger UI with Try it out
- **http://localhost:8000/api/redoc/** — ReDoc documentation

The OpenAPI schema auto-documents all request/response bodies, status codes,
authentication requirements (`BearerAuth`), and field validations.
