from django.urls import path
from .views import (
    MyAttendanceView,
    OverallAttendanceView,
    SubjectSummaryView,
    MonthlyAttendanceView,
)


urlpatterns = [
    path(
        "my/",
        MyAttendanceView.as_view(),
        name="my-attendance",
    ),
    path(
        "overall/",
        OverallAttendanceView.as_view(),
        name="overall-attendance",
    ),
    path(
        "subject-summary/",
        SubjectSummaryView.as_view(),
        name="subject-summary",       
    ),
    path(
        "monthly/",
        MonthlyAttendanceView.as_view(),
        name="monthly-attendance",
    ),
]