from django.contrib import admin

from utils.export_csv import ExportCsv
from .models import Company


# Register your models here.
@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin, ExportCsv):
    list_display = ('company', 'logo', 'domain', 'location_address')
    list_filter = ('company', 'logo', 'domain', 'location_address')
    actions = ["export_as_csv"]
