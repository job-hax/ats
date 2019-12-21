from django.shortcuts import render
from django.http import JsonResponse

from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view

from JH_RestAPI import pagination


import requests
from utils.error_codes import ResponseCodes
from rest_framework.parsers import JSONParser
import json
from utils.generic_json_creator import create_response
from cvparser.models import Resume
from cvparser.serializer import ResumeSerializer
from positionapps.models import PositionApplication
from cvparser.utils import common_attr, top_skills_in

# Create your views here.


@csrf_exempt
@api_view(["GET", "POST"])
def resume_parser(request):
    if request.method == "GET":
        pos_app_id = request.GET.get('id')
        if pos_app_id is not None:
            resume = Resume.objects.filter(pos_app__pk=pos_app_id)
            resume = ResumeSerializer(instance=resume, many=True).data
            return JsonResponse(create_response(data=resume), safe=False)
        else:
            user = request.user
            resumes = Resume.objects.filter(user=user).values()
            resumes_list = ResumeSerializer(instance=resumes, many=True).data
            return JsonResponse(create_response(data=resumes_list), safe=False)
    elif request.method == "POST":
        body = request.data
        if 'resume' in body and 'pos_app_id' in body:
            pos_app = PositionApplication.objects.get(
                pk=body['pos_app_id'])
            pre_resumes = Resume.objects.filter(pos_app__pk=body['pos_app_id'])
            post_data = body['resume']
            files = {'resume': post_data}
            response = requests.post(
                'http://127.0.0.1:8002/api/parser/', files=files)
            if response.status_code == requests.codes.ok:
                json_res = json.loads(response.text)
                # fill the model
                resume = Resume()
                resume.user = request.user
                resume.contact = json_res['contact']
                resume.skills = json_res['skills']
                resume.linkedin = json_res['linkedin']
                resume.certifications = json_res['certifications']
                resume.summary = json_res['summary']
                resume.languages = json_res['languages']
                resume.school = json_res['school']
                resume.degree = json_res['degree']
                resume.company = json_res['company']
                resume.position = json_res['position']
                resume.startdate = json_res['startdate']
                resume.enddate = json_res['enddate']
                resume.pos_app = pos_app
                if pre_resumes is not None:
                    for pre_resume in pre_resumes:
                        pre_resume.delete()
                resume.save()
                resume = ResumeSerializer(instance=resume, many=False).data
                return JsonResponse(create_response(data=resume), safe=False)
            else:
                return JsonResponse(create_response(success=False, error_code=ResponseCodes.invalid_parameters), safe=False)
        return JsonResponse(create_response(success=False, error_code=ResponseCodes.invalid_parameters), safe=False)
    else:
        return JsonResponse(create_response(success=False, error_code=ResponseCodes.invalid_parameters), safe=False)


@csrf_exempt
@api_view(["GET"])
def metrics(request):
    if request.method == 'GET':
        user = request.user
        resumes = Resume.objects.filter(user=user).values()
        resumes_list = ResumeSerializer(instance=resumes, many=True).data
        attrs = ['skills', 'position', 'languages',
                 'school', 'company', 'degree', 'certifications']
        res = {i: {} for i in attrs}

        top_number = 10
        for attr in attrs:
            for x, cnt in common_attr(attr, resumes_list, top_number):
                res[attr][x] = {
                    "count": cnt,
                    "percentage": cnt / len(resumes_list)
                }

            # company = 'OpenGov Inc.'  # amazon, apple, facebook, google, salesforce
            # for skill, cnt in top_skills_in(company, resumes_list, top_number):
            #     res[attr].append(
            #         "{}, {} people, {}".format(company, cnt, skill))

        return JsonResponse(create_response(data=res), safe=False)
