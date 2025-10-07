from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow read for authenticated users, allow unsafe methods only to admin/superuser.
    """
    def has_permission(self, request, view):
        # allow any authenticated user to GET/HEAD/OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        # otherwise require staff/superuser
        return request.user and request.user.is_staff
