from django.utils import timezone

from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from django.db import models
from django.utils.translation import gettext as _

from company.models import Company
from position.models import PositionDetail

User = get_user_model()


class ApplicationStatus(models.Model):
    value = models.CharField(max_length=20)
    icon = models.FileField(blank=True, null=True)
    pos = models.SmallIntegerField(default='0', verbose_name=_('position'))
    rejectable = models.BooleanField(default=True)
    default = models.BooleanField(default=False)

    class Meta:
        ordering = ['value']
        verbose_name = _('status')
        verbose_name_plural = _('statuses')
        ordering = ['pos']

    def __str__(self):
        return self.value if self.value is not None else ''


class PositionApplication(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True)
    application_status = models.ForeignKey(
        ApplicationStatus, on_delete=models.SET_NULL, null=True, blank=True, related_name='%(class)s_application_status')
    position = models.ForeignKey(
        PositionDetail, on_delete=models.SET_NULL, null=True, related_name='%(class)s_position')
    company_object = models.ForeignKey(
        Company, on_delete=models.SET_NULL, null=True, related_name='%(class)s_company')
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    reference = models.CharField(max_length=50, null=True, blank=True)
    email = models.EmailField(('email address'), null=True, blank=True)
    phone_number = models.CharField(max_length=17, blank=True)  # validators should be a list
    candidate_resume = models.FileField(blank=False, null=True)
    apply_date = models.DateTimeField(blank=True)
    rejected_date = models.DateTimeField(null=True, blank=True)
    deleted_date = models.DateTimeField(null=True, blank=True)
    is_rejected = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_date = models.DateTimeField(
        default=timezone.now, null=True, blank=True)
    updated_date = models.DateTimeField(null=True, blank=True)


class StatusHistory(models.Model):
    pos_app = models.ForeignKey(
        PositionApplication, on_delete=models.CASCADE, null=True, blank=True)
    application_status = models.ForeignKey(
        ApplicationStatus, on_delete=models.SET_NULL, null=True, blank=True, related_name='%(class)s_application_status')
    updated_date = models.DateTimeField(default=timezone.now, blank=True)


class PositionApplicationNote(models.Model):
    pos_app = models.ForeignKey(
        PositionApplication, on_delete=models.CASCADE, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created_date = models.DateTimeField(default=timezone.now, blank=True)
    updated_date = models.DateTimeField(
        default=timezone.now, null=True, blank=True)


class Contact(models.Model):
    pos_app = models.ForeignKey(
        PositionApplication, on_delete=models.CASCADE, null=True, blank=True)
    email = models.CharField(max_length=150, null=True, blank=True)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    phone_number = models.CharField(
        validators=[phone_regex], max_length=17, blank=True, null=True)  # validators should be a list
    linkedin_url = models.CharField(max_length=100, blank=True, null=True)
    position = models.ForeignKey(
        PositionDetail, on_delete=models.SET_NULL, null=True, related_name='%(class)s_position')
    company = models.ForeignKey(
        Company, on_delete=models.SET_NULL, null=True, related_name='%(class)s_company')
    description = models.TextField(null=True, blank=True)
    created_date = models.DateTimeField(default=timezone.now, blank=True)
    updated_date = models.DateTimeField(
        default=timezone.now, null=True, blank=True)


class Feedback(models.Model):
    pos_app = models.ForeignKey(
        PositionApplication, on_delete=models.CASCADE, null=True, blank=True)
    interviewer = models.CharField(max_length=50, null=True, blank=True)
    interview_round = models.CharField(max_length=50, null=True, blank=True)
    rate = models.IntegerField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    interview_date = models.DateTimeField(null=True, blank=True)
    created_date = models.DateTimeField(default=timezone.now, blank=True)
    updated_date = models.DateTimeField(
        default=timezone.now, null=True, blank=True)
