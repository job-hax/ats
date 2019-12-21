from django.contrib import admin

from utils.export_csv import ExportCsv
from .models import JobPosition
from .models import PositionDetail


# Register your models here.
@admin.register(JobPosition)
@admin.register(PositionDetail)
class JobPositionAdmin(admin.ModelAdmin, ExportCsv):
#     list_display = ("id", "job_title")
    actions = ["export_as_csv"]