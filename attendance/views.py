from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Attendance
from .serializers import AttendanceSerializer

from django.db.models import Count
from collections import defaultdict

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

        subjects = attendance_records.values_list(
            "subject",
            flat=True
        ).distinct()

        result = []

        for subject in subjects:
            total_classes = attendance_records.filter(
                subject=subject
            ).count()

            present_classes = attendance_records.filter(
                subject=subject,
                status="Present"
            ).count()

            percentage = (
                (present_classes / total_classes) * 100
                if total_classes > 0 else 0
            )

            result.append({
                "subject": subject,
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
# Create your views here.

