from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from major import views

urlpatterns = [
    path('', views.majors),
]
urlpatterns = format_suffix_patterns(urlpatterns)
