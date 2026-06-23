from django.contrib import admin
from .models import Subject, Attendance


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name")
    search_fields = ("code", "name")


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student",
        "subject",
        "staff",
        "date",
        "status",
    )

    list_filter = (
        "status",
        "subject",
        "date",
    )

    search_fields = (
        "student__username",
        "subject__name",
        "subject__code",
    )

# Register your models here.
