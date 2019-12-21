from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from positionapps import views

urlpatterns = [
    path('statuses/', views.statuses),
    path('', views.position_applications),
    path('<int:pos_app_pk>/statusHistory/', views.status_history),
    path('<int:pos_app_pk>/notes/', views.notes),
    path('<int:pos_app_pk>/contacts/', views.contacts),
    path('<int:pos_app_pk>/feedbacks/', views.feedbacks),
]
urlpatterns = format_suffix_patterns(urlpatterns)
