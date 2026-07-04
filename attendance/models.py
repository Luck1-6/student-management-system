from django.db import models
from users.models import CustomUser


class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)

    class Meta:
        db_table = "attendance_subject"

    def __str__(self):
        return f"{self.code} - {self.name}"


class Attendance(models.Model):

    STATUS_CHOICES = (
        ("Present", "Present"),
        ("Absent", "Absent"),
    )

    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )

    staff = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name="marked_attendance"
    )

    date = models.DateField()

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES
    )

    class Meta:
        db_table = "attendance_record"
        ordering = ["-date"]

        constraints = [
            models.UniqueConstraint(
                fields=["student", "subject", "date"],
                name="unique_student_subject_date"
            )
        ]

    def __str__(self):
        return (
            f"{self.student.username} - "
            f"{self.subject.code} - "
            f"{self.date}"
        )