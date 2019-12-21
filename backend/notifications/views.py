from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view

from utils.generic_json_creator import create_response
from . import models
from .serializers import NotificationSerializer


@csrf_exempt
@api_view(["GET"])
def notifications(request):
    queryset = models.Notification.objects.all()
    return JsonResponse(create_response(data=NotificationSerializer(instance=queryset, many=True).data), safe=False)
