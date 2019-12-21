from rest_framework import serializers

from .models import College


class CollegeSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        return College.objects.create(**validated_data)

    class Meta:
        model = College
        fields = '__all__'
