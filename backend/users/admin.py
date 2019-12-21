from django.contrib import admin

from utils.export_csv import ExportCsv
from .models import User, EmploymentStatus, Feedback, UserType


@admin.register(User)
class UserAdmin(admin.ModelAdmin, ExportCsv):
    list_display = ("email", "first_name", "last_name", "username", "user_type", 'signup_flow_completed', "gender", "college",
                    "student_email", "phone_number", "dob")
    list_filter = ("email", "first_name", "last_name", "username", "user_type", 'signup_flow_completed', "gender", "college",
                    "student_email", "phone_number", "dob")
    actions = ["export_as_csv"]


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin, ExportCsv):
    list_display = ("user", "text", "star")
    list_filter = ("user", "text", "star")
    actions = ["export_as_csv"]


@admin.register(EmploymentStatus)
class EmploymentStatusAdmin(admin.ModelAdmin, ExportCsv):
    list_display = ("id", "value")


@admin.register(UserType)
class UserTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
