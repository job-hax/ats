from django.contrib import admin

from utils.export_csv import ExportCsv
from .models import PositionApplication, ApplicationStatus, Contact, Feedback


# Register your models here.
@admin.register(PositionApplication)
class PositionApplicationAdmin(admin.ModelAdmin, ExportCsv):
    list_display = ("user", "first_name", "last_name", "application_status", "position",
                    'company_object', 'is_deleted', 'apply_date')
    list_filter = ("user", "application_status", "position",
                   'company_object', 'apply_date')
    actions = ["export_as_csv"]


@admin.register(ApplicationStatus)
class ApplicationStatusAdmin(admin.ModelAdmin):
    list_display = ("value", "pos", "rejectable", "default")


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("id", "created_date", "updated_date")


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("id", "interviewer", "rate", "description",
                    "interview_date", "created_date", "updated_date")
