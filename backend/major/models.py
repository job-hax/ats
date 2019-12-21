from django.db import models


class Major(models.Model):
    name = models.CharField(max_length=200, blank=True)
    supported = models.BooleanField(default=False)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name if self.name is not None else ''
