import uuid
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                ("password", models.CharField(max_length=128, verbose_name="password")),
                ("last_login", models.DateTimeField(blank=True, null=True, verbose_name="last login")),
                (
                    "id",
                    models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
                ),
                ("full_name", models.CharField(max_length=120)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("phone", models.CharField(blank=True, max_length=20, null=True, unique=True)),
                (
                    "role",
                    models.CharField(
                        choices=[("user", "User"), ("vendor", "Vendor"), ("admin", "Admin")],
                        default="user",
                        max_length=10,
                    ),
                ),
                ("city", models.CharField(blank=True, max_length=120, null=True)),
                ("household_size", models.PositiveIntegerField(blank=True, null=True)),
                ("monthly_income", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ("onboarding_completed", models.BooleanField(default=False)),
                ("is_active", models.BooleanField(default=True)),
                ("is_staff", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Specific permissions for this user.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.permission",
                        verbose_name="user permissions",
                    ),
                ),
            ],
            options={},
        ),
        migrations.CreateModel(
            name="Vendor",
            fields=[
                (
                    "id",
                    models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
                ),
                ("shop_name", models.CharField(max_length=150)),
                ("city", models.CharField(max_length=120)),
                ("latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=10, null=True)),
                ("longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=10, null=True)),
                ("joined_at", models.DateTimeField(auto_now_add=True)),
                ("owner", models.ForeignKey(on_delete=models.deletion.CASCADE, to="users.user")),
            ],
        ),
        migrations.CreateModel(
            name="Notification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("type", models.CharField(max_length=50)),
                ("message", models.TextField()),
                ("is_read", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(on_delete=models.deletion.CASCADE, to="users.user")),
            ],
        ),
    ]
