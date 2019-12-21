from django.contrib import admin

# Register your models here.
from college.models import College


@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ("name", "country", "alpha_two_code", "state_province")
    list_filter = ("name", "country", "alpha_two_code", "state_province")
