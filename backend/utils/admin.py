from django.contrib import admin

from .models import *


# Register your models here.
@admin.register(Agreement)
class UserAdmin(admin.ModelAdmin):
    list_display = ('key', 'is_html')


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ("name", "region", "code2", "code3")
    list_filter = ("name", "region", "code2", "code3")


class FeedbackQuestionItemInline(admin.TabularInline):
    model = FeedbackQuestionItem
    extra = 0
    max_num = 15


@admin.register(FeedbackQuestion)
class FeedbackQuestionAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'answer_count', 'is_published')
    inlines = [FeedbackQuestionItemInline, ]


@admin.register(FeedbackAnswer)
class FeedbackAnswerAdmin(admin.ModelAdmin):
    list_display = ('feedback_question', 'answer', 'user_input', 'ip', 'datetime')
    list_filter = ('feedback_question', 'datetime')


