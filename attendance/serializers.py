from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source="subject.name")
    staff = serializers.CharField(source="staff.username")

    class Meta:
        model = Attendance
        fields = [
            "id",
            "date",
            "subject",
            "status",
            "staff",
        ]