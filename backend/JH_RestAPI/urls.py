"""JH_RestAPI URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import include
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from django.urls import re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/positionapps/', include('positionapps.urls')),
    path('api/faqs/', include('faq.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/companies/', include('company.urls')),
    path('api/colleges/', include('college.urls')),
    path('api/majors/', include('major.urls')),
    path('api/positions/', include('position.urls')),
    path('api/parser/', include('cvparser.urls')),
    path('api/', include('utils.urls')),
    re_path(r'^auth/', include('rest_framework_social_oauth2.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
