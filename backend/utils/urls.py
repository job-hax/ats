from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from utils import views

urlpatterns = [
    path('agreements/', views.agreements),
    path('demo/', views.demo),
    path('countries/', views.countries),
    path('countries/<int:country_pk>/states/',
         views.states),
    path('feedbacks/', views.feedbacks),
    path('feedbacks/<int:feedback_pk>/answer/',
         views.answer_feedback),
]
urlpatterns = format_suffix_patterns(urlpatterns)
