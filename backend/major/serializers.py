from rest_framework import serializers

from .models import Major


class MajorSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        return Major.objects.create(**validated_data)

    class Meta:
        model = Major
        fields = '__all__'
