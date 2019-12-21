from django.db import models
from django.utils import timezone
from utils.models import Country
from utils.models import State
from company.models import Company


class JobPosition(models.Model):
    job_title = models.CharField(max_length=200, blank=False)

    class Meta:
        ordering = ['job_title']

    def __str__(self):
        return self.job_title if self.job_title is not None else ''


class PositionDetail(models.Model):
    job = models.ForeignKey(
        JobPosition, on_delete=models.SET_NULL, null=True, blank=False)
    responsibilities = models.TextField(blank=False)
    requirements = models.TextField(blank=False)
    department = models.CharField(max_length=200, blank=False)
    job_type = models.CharField(max_length=200, blank=False)
    city = models.CharField(max_length=200, blank=False)
    country = models.ForeignKey(
        Country, on_delete=models.SET_NULL, null=True, blank=False)
    state = models.ForeignKey(
        State, on_delete=models.SET_NULL, null=True, blank=False)
    company = models.ForeignKey(
        Company, on_delete=models.SET_NULL, null=True, related_name='%(class)s_company', blank=False)
    is_deleted = models.BooleanField(default=False)
    created_date = models.DateTimeField(
        default=timezone.now, null=True, blank=False)
    updated_date = models.DateTimeField(
        default=timezone.now, null=True, blank=False)

    class Meta:
        ordering = ['updated_date']
