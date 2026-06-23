from django.core.management.base import BaseCommand
from users.models import CustomUser


class Command(BaseCommand):
    help = "Create default users"

    def handle(self, *args, **kwargs):

        users = [
            {
                "username": "admin",
                "email": "admin@example.com",
                "password": "Admin@123",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            },
            {
                "username": "staff1",
                "email": "staff@example.com",
                "password": "Staff@123",
                "role": "staff",
                "is_staff": True,
                "is_superuser": False,
            },
            {
                "username": "student1",
                "email": "student@example.com",
                "password": "Student@123",
                "role": "student",
                "is_staff": False,
                "is_superuser": False,
            },
        ]

        for user_data in users:
            if not CustomUser.objects.filter(
                username=user_data["username"]
            ).exists():

                password = user_data.pop("password")

                user = CustomUser.objects.create(**user_data)
                user.set_password(password)
                user.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created {user.username}'
                    )
                )