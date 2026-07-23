from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Allows access only to authenticated users
    whose role is 'admin'.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "admin"
        )