from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from users.models import Notification, User, Vendor


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ("email",)
    list_display = ("email", "full_name", "role", "onboarding_completed", "is_staff")
    search_fields = ("email", "full_name", "phone")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Profile",
            {
                "fields": (
                    "full_name",
                    "phone",
                    "role",
                    "city",
                    "household_size",
                    "monthly_income",
                    "onboarding_completed",
                )
            },
        ),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "full_name", "password1", "password2", "is_staff", "is_superuser"),
            },
        ),
    )
    readonly_fields = ("created_at", "updated_at", "last_login")


admin.site.register(Vendor)
admin.site.register(Notification)

# Register your models here.
