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

class AdminAttendanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = [
            "date",
            "subject",
            "status",
        ]        

class StaffManagementSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        style={"input_type": "password"}
    )

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
            "is_active",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "date_joined",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            password=password,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            email=validated_data.get("email", ""),
            role="staff",
            is_active=True,
        )

        return user

    def update(self, instance, validated_data):
        validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance     