from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.conf import settings
from college.serializers import CollegeSerializer
from company.serializers import CompanyBasicsSerializer
from major.serializers import MajorSerializer
from position.serializers import JobPositionSerializer
from utils.serializers import CountrySerializer, StateSerializer
from .models import EmploymentStatus, UserType

User = get_user_model()


class UserTypeSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        return UserType.objects.create(**validated_data)

    class Meta:
        model = UserType
        fields = ('__all__')


class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField(required=False)
    signup_flow_completed = serializers.SerializerMethodField(required=False)
    user_type = serializers.SerializerMethodField(required=False, read_only=True)

    def __init__(self, *args, **kwargs):
        super(UserSerializer, self).__init__(*args, **kwargs)
        if 'detailed' not in self.context:
            del self.fields['is_admin']
            del self.fields['user_type']
            del self.fields['signup_flow_completed']

    def get_is_admin(self, obj):
        if self.context.get('detailed'):
            return obj.is_staff

    def get_signup_flow_completed(self, obj):
        if self.context.get('detailed'):
            return obj.signup_flow_completed

    def get_user_type(self, obj):
        if self.context.get('detailed'):
            return UserTypeSerializer(instance=obj.user_type, many=False).data

    def create(self, validated_data):
        return User.objects.create(**validated_data)

    class Meta:
        model = User
        fields = ('id', 'first_name', 'profile_photo', 'last_name', 'date_joined', 'is_admin', 'user_type', 'signup_flow_completed')


class EmploymentStatusSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        return EmploymentStatus.objects.create(**validated_data)

    class Meta:
        model = EmploymentStatus
        fields = ('__all__')


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    emp_status = EmploymentStatusSerializer(read_only=True)
    college = CollegeSerializer(read_only=True)
    major = MajorSerializer(read_only=True)
    company = CompanyBasicsSerializer(read_only=True)
    country = CountrySerializer(read_only=True)
    state = StateSerializer(read_only=True)
    job_position = JobPositionSerializer(read_only=True)
    dob = serializers.DateField(format="%Y-%m-%d")
    is_google_linked = serializers.SerializerMethodField()
    is_linkedin_linked = serializers.SerializerMethodField()

    def get_is_google_linked(self, obj):
        if obj.social_auth.filter(provider='google-oauth2').count() == 0:
            return False
        return True

    def get_is_linkedin_linked(self, obj):
        if obj.social_auth.filter(provider='linkedin-oauth2').count() == 0:
            return False
        return True

    class Meta:
        model = User
        exclude = ['password', 'last_login', 'is_superuser', 'is_staff',
                   'is_active', 'is_demo', 'activation_key', 'key_expires',
                   'forgot_password_key', 'forgot_password_key_expires', 'approved', 'groups', 'user_permissions']
