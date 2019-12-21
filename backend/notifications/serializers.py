import pytz
from rest_framework import serializers

from . import models


class NotificationSerializer(serializers.ModelSerializer):

    def get_created_at(self, obj):
        if obj.date is None:
            return None
        return obj.date.astimezone(pytz.timezone('US/Pacific'))

    class Meta:
        fields = ('id', 'title', 'content', 'image', 'created_at')
        model = models.Notification
