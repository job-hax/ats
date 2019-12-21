from django.contrib import admin

from .models import *

@admin.register(Faq)
class FaqAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published')
