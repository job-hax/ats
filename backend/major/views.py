from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view

from JH_RestAPI import pagination
from utils.generic_json_creator import create_response
from .models import Major
from .serializers import MajorSerializer


# Create your views here.


@csrf_exempt
@api_view(["GET"])
def majors(request):
    q = request.GET.get('q')
    if q is None:
        majors = Major.objects.all()
    else:
        majors = Major.objects.filter(name__icontains=q)
    paginator = pagination.CustomPagination()
    majors = paginator.paginate_queryset(majors, request)
    serialized_majors = MajorSerializer(
        instance=majors, many=True, ).data
    return JsonResponse(create_response(data=serialized_majors, paginator=paginator), safe=False)
