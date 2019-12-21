from rest_framework import serializers
import pytz
from .models import *


class AgreementSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        return Agreement.objects.create(**validated_data)

    class Meta:
        model = Agreement
        fields = ('key', 'is_html', 'value')


class CountrySerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        return Country.objects.create(**validated_data)

    class Meta:
        model = Country
        fields = ('id', 'code2', 'name')


class StateSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        return State.objects.create(**validated_data)

    class Meta:
        model = State
        fields = ('id', 'code', 'name')


class FeedbackQuestionItemSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        return FeedbackQuestionItem.objects.create(**validated_data)

    class Meta:
        model = FeedbackQuestionItem
        fields = ('id', 'value', 'pos', 'custom_input')


class FeedbackQuestionSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    def create(self, validated_data):
        return FeedbackQuestion.objects.create(**validated_data)

    def get_items(self, obj):
        answers = FeedbackQuestionItem.objects.filter(feedback_question=obj)
        return FeedbackQuestionItemSerializer(instance=answers, many=True).data

    def get_date(self, obj):
        if obj.date is None:
            return None
        return obj.date.astimezone(pytz.timezone('US/Pacific'))

    class Meta:
        model = FeedbackQuestion
        fields = ('id', 'title', 'date', 'is_published', 'items')
