import pytz
from rest_framework import serializers

from .models import Faq
from .models import Item


class ItemSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        return Item.objects.create(**validated_data)

    class Meta:
        model = Item
        fields = ('id', 'value', 'position')


class FaqSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        return Faq.objects.create(**validated_data)

    def get_date(self, obj):
        if obj.date is None:
            return None
        return obj.date.astimezone(pytz.timezone('US/Pacific'))

    class Meta:
        model = Faq
        fields = ('id', 'title', 'description', 'is_published')
