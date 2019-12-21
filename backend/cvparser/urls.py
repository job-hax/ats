from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from cvparser import views

urlpatterns = [
    path('', views.resume_parser),
    path('metrics', views.metrics)

]
urlpatterns = format_suffix_patterns(urlpatterns)
