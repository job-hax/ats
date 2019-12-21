from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth import get_user_model

from positionapps.models import PositionApplication

User = get_user_model()


# Create your models here.

class Resume(models.Model):
    contact = ArrayField(models.TextField(null=True, blank=True))
    skills = ArrayField(models.TextField(null=True, blank=True))
    linkedin = models.CharField(max_length=200, blank=False)
    certifications = ArrayField(models.TextField(null=True, blank=True))
    summary = ArrayField(models.TextField(null=True, blank=True))
    languages = ArrayField(models.TextField(null=True, blank=True))
    school = models.CharField(max_length=200, blank=False)
    degree = models.CharField(max_length=200, blank=False)
    company = models.CharField(max_length=200, blank=False)
    position = models.CharField(max_length=200, blank=False)
    startdate = models.CharField(max_length=200, blank=False)
    enddate = models.CharField(max_length=200, blank=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True)
    pos_app = models.ForeignKey(
        PositionApplication, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        ordering = ['linkedin']
