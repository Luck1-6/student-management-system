from django.db import IntegrityError

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Attendance
from .serializers import AttendanceSerializer
from .serializers import AttendanceUpdateSerializer

from django.db.models import Count
from collections import defaultdict

from users.models import CustomUser
from .models import Subject
from .serializers import (
    AttendanceCreateSerializer,
    SubjectSerializer,
    AttendanceStatusUpdateSerializer,
)

class MyAttendanceView(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Attendance.objects.filter(
            student=self.request.user
        ).select_related(
            "subject",
            "staff"
        )

class OverallAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user

        total_classes = Attendance.objects.filter(
            student=student
        ).count()

        present_classes = Attendance.objects.filter(
            student=student,
            status="Present"
        ).count()

        absent_classes = Attendance.objects.filter(
            student=student,
            status="Absent"
        ).count()

        percentage = (
            (present_classes / total_classes) * 100
            if total_classes > 0 else 0
        )

        return Response({
            "total_classes": total_classes,
            "present_classes": present_classes,
            "absent_classes": absent_classes,
            "attendance_percentage": round(percentage, 2)
        })

class SubjectSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user

        attendance_records = Attendance.objects.filter(
            student=student
        )

        result = []

        subject_names = attendance_records.values_list(
            "subject__name",
            flat=True
        ).distinct()

        for subject_name in subject_names:

            subject_records = attendance_records.filter(
                subject__name=subject_name
            )

            total_classes = subject_records.count()

            present_classes = subject_records.filter(
                status="Present"
            ).count()

            percentage = (
                (present_classes / total_classes) * 100
                if total_classes > 0 else 0
            )

            result.append({
                "subject": subject_name,
                "total_classes": total_classes,
                "present_classes": present_classes,
                "attendance_percentage": round(percentage, 2)
            })

        return Response(result)  

class MonthlyAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user

        records = Attendance.objects.filter(
            student=student
        ).order_by("-date")

        monthly_data = defaultdict(
            lambda: {
                "total_classes": 0,
                "present_classes": 0,
                "absent_classes": 0
            }
        )

        for record in records:
            month = record.date.strftime("%Y-%m")

            monthly_data[month]["total_classes"] += 1

            if record.status == "Present":
                monthly_data[month]["present_classes"] += 1
            else:
                monthly_data[month]["absent_classes"] += 1

        result = []

        for month, data in monthly_data.items():
            percentage = (
                data["present_classes"] /
                data["total_classes"] * 100
            ) if data["total_classes"] > 0 else 0

            result.append({
                "month": month,
                "total_classes": data["total_classes"],
                "present_classes": data["present_classes"],
                "absent_classes": data["absent_classes"],
                "attendance_percentage": round(
                    percentage, 2
                )
            })

        return Response(result)        

class StudentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        students = CustomUser.objects.filter(
            role="student"
        )

        data = [
            {
                "id": student.id,
                "username": student.username,
                "name": student.get_full_name(),
            }
            for student in students
        ]

        return Response(data)

class SubjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        subjects = Subject.objects.all().order_by("name")

        serializer = SubjectSerializer(
            subjects,
            many=True
        )

        return Response(serializer.data)        

class MarkAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = AttendanceCreateSerializer(
            data=request.data
        )

        if serializer.is_valid():

            try:
                attendance = serializer.save(
                    staff=request.user
                )

                return Response({
                    "message": "Attendance marked successfully",
                    "id": attendance.id
                })

            except IntegrityError:
                return Response(
                    {
                        "error": "Attendance has already been marked for this student, subject and date."
                    },
                    status=400
              )     
        return Response(
            serializer.errors,
            status=400
        )         

class UpdateAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):

        try:
            attendance = Attendance.objects.get(id=pk)

        except Attendance.DoesNotExist:
            return Response(
                {"error": "Attendance record not found"},
                status=404
            )

        serializer = AttendanceStatusUpdateSerializer(
            attendance,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response({
                "message": "Attendance updated successfully"
            })

        return Response(
            serializer.errors,
            status=400
        )                  

class LoadAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subject_id = request.GET.get("subject")
        date = request.GET.get("date")

        if not subject_id or not date:
            return Response(
                {"error": "Subject and date are required."},
                status=400
            )

        attendance = Attendance.objects.filter(
            subject_id=subject_id,
            date=date
        ).select_related("student")

        serializer = AttendanceUpdateSerializer(attendance, many=True)
        return Response(serializer.data)        
# Create your views here.

