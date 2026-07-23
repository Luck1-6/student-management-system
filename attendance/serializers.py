from rest_framework import serializers
from .models import Attendance

from users.models import CustomUser
from .models import Subject

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

class AttendanceCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Attendance
        fields = [
            "student",
            "subject",
            "date",
            "status",
        ]        

class SubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
        ]        

class AttendanceUpdateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.username",
        read_only=True
    )

    class Meta:
        model = Attendance
        fields = [
            "id",
            "student",
            "student_name",
            "status",
        ]

        
class AttendanceStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ["status"]        

class AdminAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.username",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    staff_name = serializers.CharField(
        source="staff.username",
        read_only=True
    )

    class Meta:
        model = Attendance
        fields = [
            "id",
            "date",
            "student_id",
            "student_name",
            "subject_id",
            "subject_name",
            "staff_name",
            "status",
        ]       