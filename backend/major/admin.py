from django.contrib import admin

from major.models import Major


@admin.register(Major)
class MajorAdmin(admin.ModelAdmin):
    list_display = ("name", "supported")
