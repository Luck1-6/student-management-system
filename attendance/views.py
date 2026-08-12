from django.db import IntegrityError

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from users.permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated

from rest_framework import status
from django.shortcuts import get_object_or_404


from django.db.models import Count, Q
from collections import defaultdict

from datetime import date

from users.models import CustomUser
from .models import Subject
from .models import Attendance
from .serializers import (
    AttendanceCreateSerializer,
    SubjectSerializer,
    AttendanceStatusUpdateSerializer,
    AdminAttendanceUpdateSerializer,
    AdminAttendanceSerializer,
    AttendanceUpdateSerializer,
    AttendanceSerializer,
    StaffManagementSerializer
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

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "admin":
            return Response(
                {"error": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN,
            )

        total_students = CustomUser.objects.filter(
            role="student"
        ).count()

        total_staff = CustomUser.objects.filter(
            role="staff"
        ).count()

        total_subjects = Subject.objects.count()

        total_attendance_records = Attendance.objects.count()

        today = date.today()

        today_records = Attendance.objects.filter(
            date=today
        )

        today_total = today_records.count()

        today_present = today_records.filter(
            status="Present"
        ).count()

        today_percentage = (
            (today_present / today_total) * 100
            if today_total > 0
            else 0
        )

        total_present = Attendance.objects.filter(
            status="Present"
        ).count()

        overall_percentage = (
            (total_present / total_attendance_records) * 100
            if total_attendance_records > 0
            else 0
        )

        return Response(
            {
                "total_students": total_students,
                "total_staff": total_staff,
                "total_subjects": total_subjects,
                "total_attendance_records": total_attendance_records,
                "today_attendance_percentage": round(
                    today_percentage, 2
                ),
                "overall_attendance_percentage": round(
                    overall_percentage, 2
                ),
            }
        )      

class AdminAttendanceListView(ListAPIView):
    """
    Admin:
    View every attendance record.

    Supports filtering by:
    - date
    - student
    - subject
    - staff
    - status
    """

    serializer_class = AdminAttendanceSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = (
            Attendance.objects
            .select_related(
                "student",
                "subject",
                "staff",
            )
            .all()
            .order_by("-date", "-id")
        )

        date = self.request.query_params.get("date")
        student = self.request.query_params.get("student")
        subject = self.request.query_params.get("subject")
        staff = self.request.query_params.get("staff")
        status = self.request.query_params.get("status")

        if date:
            queryset = queryset.filter(date=date)

        if student:
            queryset = queryset.filter(student_id=student)

        if subject:
            queryset = queryset.filter(subject_id=subject)

        if staff:
            queryset = queryset.filter(staff_id=staff)

        if status:
            queryset = queryset.filter(status__iexact=status)

        return queryset      

class AdminAttendanceUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        attendance = get_object_or_404(Attendance, pk=pk)

        serializer = AdminAttendanceUpdateSerializer(
            attendance,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Attendance updated successfully.",
                "data": serializer.data
            })

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )     

class AdminAttendanceDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        attendance = get_object_or_404(Attendance, pk=pk)

        attendance.delete()

        return Response(
            {
                "message": "Attendance deleted successfully."
            },
            status=status.HTTP_200_OK,
        )            

class AdminAttendanceAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        attendance = Attendance.objects.select_related(
            "student",
            "subject",
        )

        total = attendance.count()

        present = attendance.filter(
            status="Present"
        ).count()

        absent = attendance.filter(
            status="Absent"
        ).count()

        overall_percentage = (
            round((present / total) * 100, 2)
            if total else 0
        )

        # -------------------------
        # Subject-wise Attendance
        # -------------------------

        subject_data = []

        subjects = attendance.values(
            "subject__name"
        ).annotate(
            total=Count("id"),
            present=Count(
                "id",
                filter=Q(status="Present")
            )
        )

        for item in subjects:

            percentage = (
                round(
                    item["present"] * 100 / item["total"],
                    2
                )
                if item["total"] else 0
            )

            subject_data.append({
                "subject": item["subject__name"],
                "percentage": percentage,
            })

        # -------------------------
        # Daily Trend
        # -------------------------

        trend = []

        daily = attendance.values(
            "date"
        ).annotate(
            total=Count("id"),
            present=Count(
                "id",
                filter=Q(status="Present")
            )
        ).order_by("date")

        for item in daily:

            percentage = (
                round(
                    item["present"] * 100 / item["total"],
                    2
                )
                if item["total"] else 0
            )

            trend.append({
                "date": item["date"],
                "percentage": percentage,
            })

        # -------------------------
        # Student Analytics
        # -------------------------

        students = attendance.values(
            "student__first_name",
            "student__last_name",
        ).annotate(
            total=Count("id"),
            present=Count(
                "id",
                filter=Q(status="Present")
            )
        )

        student_list = []

        for item in students:

            percentage = (
                round(
                    item["present"] * 100 / item["total"],
                    2
                )
                if item["total"] else 0
            )

            student_list.append({
                "name": (
                    item["student__first_name"]
                    + " "
                    + item["student__last_name"]
                ).strip(),
                "attendance": percentage,
            })

        top_students = sorted(
            student_list,
            key=lambda x: x["attendance"],
            reverse=True,
        )[:5]

        low_students = sorted(
            student_list,
            key=lambda x: x["attendance"],
        )[:5]

        return Response({

            "overall_percentage": overall_percentage,

            "present_absent": {
                "Present": present,
                "Absent": absent,
            },

            "subject_attendance": subject_data,

            "daily_trend": trend,

            "top_students": top_students,

            "low_students": low_students,

        })        

class StudentAttendanceReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, student_id):
        try:
            student = CustomUser.objects.get(id=student_id, role="student")
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Student not found"},
                status=404
            )

        attendance = Attendance.objects.filter(student=student)

        total_present = attendance.filter(status="Present").count()
        total_absent = attendance.filter(status="Absent").count()
        total_classes = total_present + total_absent

        overall_percentage = (
            round((total_present / total_classes) * 100, 2)
            if total_classes > 0 else 0
        )

        subject_summary = (
            attendance.values("subject__name")
            .annotate(
                present=Count(
                    "id",
                    filter=Q(status="Present")
                ),
                absent=Count(
                    "id",
                    filter=Q(status="Absent")
                )
            )
            .order_by("subject__name")
        )

        subjects = []

        for item in subject_summary:
            total = item["present"] + item["absent"]

            percentage = (
                round((item["present"] / total) * 100, 2)
                if total > 0 else 0
            )

            subjects.append({
                "subject": item["subject__name"],
                "present": item["present"],
                "absent": item["absent"],
                "percentage": percentage,
            })

        data = {
            "student": {
                "id": student.id,
                "name": student.get_full_name() or student.username,
            },
            "overall": {
                "present": total_present,
                "absent": total_absent,
                "percentage": overall_percentage,
            },
            "subjects": subjects,
        }

        return Response(data)      

class StaffPerformanceView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        staff_members = CustomUser.objects.filter(role="staff")

        data = []

        for staff in staff_members:

            records = Attendance.objects.filter(staff=staff)

            total_marked = records.count()

            present = records.filter(status="Present").count()

            absent = records.filter(status="Absent").count()

            percentage = (
                round((present / total_marked) * 100, 2)
                if total_marked > 0
                else 0
            )

            data.append({
                "staff_id": staff.id,
                "staff_name": staff.get_full_name() or staff.username,
                "total_marked": total_marked,
                "present": present,
                "absent": absent,
                "attendance_percentage": percentage,
            })

        return Response(data)     
        
class StaffListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        staff = CustomUser.objects.filter(role="staff").order_by("username")

        serializer = StaffManagementSerializer(
            staff,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = StaffManagementSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class StaffUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, pk):

        staff = get_object_or_404(
            CustomUser,
            pk=pk,
            role="staff"
        )

        serializer = StaffManagementSerializer(
            staff,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )                       

class StaffStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):

        staff = get_object_or_404(
            CustomUser,
            pk=pk,
            role="staff"
        )

        staff.is_active = not staff.is_active

        staff.save()

        return Response({
            "message": "Staff status updated successfully.",
            "is_active": staff.is_active,
        })

class StaffDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):

        staff = get_object_or_404(
            CustomUser,
            pk=pk,
            role="staff"
        )

        staff.delete()

        return Response(
            {
                "message": "Staff deleted successfully."
            },
            status=status.HTTP_200_OK
        )

class LowAttendanceStudentsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        # Default threshold is 75%
        threshold = request.query_params.get("threshold", 75)

        try:
            threshold = float(threshold)
        except (TypeError, ValueError):
            return Response(
                {"error": "Threshold must be a valid number."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if threshold < 0 or threshold > 100:
            return Response(
                {"error": "Threshold must be between 0 and 100."},
                status=status.HTTP_400_BAD_REQUEST
            )

        students = CustomUser.objects.filter(
            role="student"
        ).annotate(
            total_classes=Count(
                "attendance_records"
            ),
            present_classes=Count(
                "attendance_records",
                filter=Q(
                    attendance_records__status="Present"
                )
            ),
            absent_classes=Count(
                "attendance_records",
                filter=Q(
                    attendance_records__status="Absent"
                )
            )
        )

        low_attendance_students = []

        for student in students:

            total_classes = student.total_classes
            present_classes = student.present_classes
            absent_classes = student.absent_classes

            attendance_percentage = (
                (present_classes / total_classes) * 100
                if total_classes > 0
                else 0
            )

            attendance_percentage = round(
                attendance_percentage,
                2
            )

            if attendance_percentage < threshold:

                low_attendance_students.append({
                    "student_id": student.id,
                    "student_name": (
                        student.get_full_name()
                        or student.username
                    ),
                    "total_classes": total_classes,
                    "present_classes": present_classes,
                    "absent_classes": absent_classes,
                    "attendance_percentage": attendance_percentage,
                })

        # Lowest attendance first
        low_attendance_students.sort(
            key=lambda x: x["attendance_percentage"]
        )

        return Response({
            "threshold": threshold,
            "total_low_attendance_students": len(
                low_attendance_students
            ),
            "students": low_attendance_students
        })         
# Create your views here.

