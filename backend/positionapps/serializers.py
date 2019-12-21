import pytz
from rest_framework import serializers

from company.serializers import CompanySerializer
from position.serializers import PositionDetailSerializer
from .models import ApplicationStatus
from .models import PositionApplication
from .models import PositionApplicationNote
from .models import Contact
from .models import StatusHistory
from .models import Feedback


class ApplicationStatusSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        return ApplicationStatus.objects.create(**validated_data)

    class Meta:
        model = ApplicationStatus
        fields = ('__all__')


class PositionApplicationSerializer(serializers.ModelSerializer):
    application_status = ApplicationStatusSerializer(read_only=True)
    position = PositionDetailSerializer(read_only=False)
    company_object = serializers.SerializerMethodField()

    def get_company_object(self, obj):
        context = self.context
        context['position'] = obj.position
        return CompanySerializer(instance=obj.company_object, many=False, context=context).data

    def create(self, validated_data):
        return PositionApplication.objects.create(**validated_data)

    class Meta:
        model = PositionApplication
        fields = (
            'id', 'first_name', 'last_name', 'application_status', 'position', 'company_object', 'apply_date', 'is_rejected')


class PositionApplicationNoteSerializer(serializers.ModelSerializer):
    created_date = serializers.SerializerMethodField()
    updated_date = serializers.SerializerMethodField()

    def get_created_date(self, obj):
        if obj.created_date is None:
            return None
        return obj.created_date.astimezone(pytz.timezone('US/Pacific'))

    def get_updated_date(self, obj):
        if obj.updated_date is None:
            return None
        return obj.updated_date.astimezone(pytz.timezone('US/Pacific'))

    def create(self, validated_data):
        return PositionApplication.objects.create(**validated_data)

    class Meta:
        model = PositionApplicationNote
        fields = ('id', 'description', 'created_date', 'updated_date')


class StatusHistorySerializer(serializers.ModelSerializer):
    application_status = ApplicationStatusSerializer(read_only=True)

    def create(self, validated_data):
        return StatusHistory.objects.create(**validated_data)

    class Meta:
        model = StatusHistory
        fields = ('application_status', 'updated_date')


class ContactSerializer(serializers.ModelSerializer):
    position = serializers.SerializerMethodField()
    company = serializers.SerializerMethodField()

    def get_position(self, obj):
        if obj.position is not None:
            return obj.position.job_title
        return None

    def get_company(self, obj):
        if obj.company is not None:
            return obj.company.company
        return None

    def create(self, validated_data):
        return Contact.objects.create(**validated_data)

    class Meta:
        model = Contact
        fields = (
            'id', 'phone_number', 'linkedin_url', 'description', 'created_date', 'updated_date', 'position',
            'company', 'email')


class FeedbackSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        return Feedback.objects.create(**validated_data)

    class Meta:
        model = Feedback
        fields = ('__all__')
