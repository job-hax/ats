from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view

from JH_RestAPI import pagination
from position.serializers import JobPositionSerializer
from utils.generic_json_creator import create_response
from utils.utils import get_boolean_from_request
from .models import Company
from .serializers import CompanyBasicsSerializer, CompanySerializer
from utils.error_codes import ResponseCodes


@csrf_exempt
@api_view(["GET"])
def companies(request):
    q = request.GET.get('q')
    companies = Company.objects.all()
    if q is not None:
        companies = companies.filter(company__icontains=q)
    paginator = pagination.CustomPagination()
    companies = paginator.paginate_queryset(companies, request)
    serialized_companies = CompanySerializer(
        instance=companies, many=True, context={'user': request.user}).data
    return JsonResponse(create_response(data=serialized_companies, paginator=paginator), safe=False)


@csrf_exempt
@api_view(["GET", "PATCH"])
def company(request, company_pk):
    body = request.data
    if company_pk is None:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters), safe=False)
    if request.method == "GET":
        company = Company.objects.get(pk=company_pk)
        serialized_company = CompanyBasicsSerializer(
            instance=company, many=False, context={"user": request.user}).data
        return JsonResponse(create_response(data=serialized_company), safe=False)
    elif request.method == "PATCH":
        company = Company.objects.get(pk=company_pk)
        company_name = body.get("company")
        domain = body.get("domain")
        location_address = body.get("location_address")
        description = body.get("description")
        employees_number = body.get("employees_number")
        phone_number = body.get("phone_number")

        if company_name is not None:
            company.company = company_name
        if domain is not None:
            company.domain = domain
        if location_address is not None:
            company.location_address = location_address
        if description is not None:
            company.description = description
        if employees_number is not None:
            company.employees_number = employees_number
        if phone_number is not None:
            company.phone_number = phone_number

        company.save()
        return JsonResponse(create_response(data=CompanyBasicsSerializer(instance=company, many=False, context={"user": request.user}).data), safe=False)
