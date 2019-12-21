from enum import IntEnum

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.validators import RegexValidator
from django.db import models

from college.models import College
from company.models import Company
from major.models import Major
from position.models import JobPosition
from utils.models import Country, State


class EmploymentStatus(models.Model):
    value = models.CharField(max_length=20, default='N/A')


class UserType(models.Model):
    name = models.CharField(max_length=20)
    alumni_listing_enabled = models.BooleanField(default=False, null=False)
    blog_creation_enabled = models.BooleanField(default=False, null=False)
    event_creation_enabled = models.BooleanField(default=False, null=False)
    college_specific_metrics_enabled = models.BooleanField(default=False, null=False)

    def __str__(self):
        return self.name if self.name is not None else ''


class User(AbstractUser):
    objects = UserManager()
    email = models.EmailField(('email address'), unique=True)
    is_email_public = models.BooleanField(default=True)
    approved = models.BooleanField(default=False, null=False)
    activation_key = models.TextField(null=True, blank=True)
    key_expires = models.DateTimeField(null=True, blank=True)
    forgot_password_key = models.TextField(null=True, blank=True)
    forgot_password_key_expires = models.DateTimeField(null=True, blank=True)
    gmail_last_update_time = models.IntegerField(default=0)
    user_type = models.ForeignKey(
        UserType, on_delete=models.SET_NULL, null=True, blank=True)
    is_gmail_read_ok = models.BooleanField(default=True)
    signup_flow_completed = models.BooleanField(default=False)
    synching = models.BooleanField(default=False)
    is_demo = models.BooleanField(default=False)
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('N', 'None'),
    )
    gender = models.CharField(
        max_length=1, choices=GENDER_CHOICES, default='N')
    dob = models.DateField(blank=True, null=True)
    student_email = models.EmailField(
        ('student email address'), unique=False, blank=True)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    phone_number = models.CharField(
        validators=[phone_regex], max_length=17, blank=True)  # validators should be a list
    profile_photo = models.FileField(blank=True, null=True)
    emp_status = models.ForeignKey(
        EmploymentStatus, on_delete=models.SET_NULL, null=True, blank=True)
    college = models.ForeignKey(
        College, on_delete=models.SET_NULL, null=True, blank=True)
    major = models.ForeignKey(
        Major, on_delete=models.SET_NULL, null=True, blank=True)
    grad_year = models.IntegerField(null=True, blank=True)
    company = models.ForeignKey(
        Company, on_delete=models.SET_NULL, null=True, blank=True)
    job_position = models.ForeignKey(
        JobPosition, on_delete=models.SET_NULL, null=True, blank=True)
    country = models.ForeignKey(
        Country, on_delete=models.SET_NULL, null=True, blank=True)
    state = models.ForeignKey(
        State, on_delete=models.SET_NULL, null=True, blank=True)

    class UserTypes(IntEnum):
        none = 0
        public = 1
        student = 2
        alumni = 3
        career_service = 4

    class Meta:
        verbose_name = ('user')
        verbose_name_plural = ('users')
        db_table = 'auth_user'
        swappable = 'AUTH_USER_MODEL'


class Feedback(models.Model):
    User = get_user_model()
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)
    from_demo_account = models.BooleanField(default=False)
    text = models.TextField(null=True, blank=True)
    star = models.IntegerField(validators=[
        MaxValueValidator(5),
        MinValueValidator(0)
    ], null=True, blank=True)
    created_date = models.DateTimeField(null=True, blank=True, auto_now_add=True)
