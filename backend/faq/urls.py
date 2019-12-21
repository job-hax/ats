from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from faq import views

urlpatterns = [
    path('', views.faqs),
]
urlpatterns = format_suffix_patterns(urlpatterns)
