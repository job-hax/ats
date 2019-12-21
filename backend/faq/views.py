from django.http import JsonResponse
from django.views.decorators.http import require_GET

from utils.generic_json_creator import create_response
from .models import Faq
from .serializers import FaqSerializer


@require_GET
def faqs(request):
    faq = Faq.objects.filter(is_published=True)
    list = FaqSerializer(instance=faq, many=True).data
    return JsonResponse(create_response(data=list), safe=False)
