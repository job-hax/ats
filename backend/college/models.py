from django.contrib.postgres.fields import ArrayField
from django.db import models


class College(models.Model):
    web_pages = ArrayField(models.TextField(null=True, blank=True))
    domains = ArrayField(models.TextField(null=True, blank=True))
    name = models.CharField(max_length=200, blank=False)
    alpha_two_code = models.CharField(max_length=5, blank=True)
    state_province = models.CharField(max_length=30, null=True, blank=True)
    country = models.CharField(max_length=50, blank=True)
    supported = models.BooleanField(default=False)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name if self.name is not None else ''
