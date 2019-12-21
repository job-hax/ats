from datetime import datetime as dt
from django.utils import timezone

from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view

from company.utils import get_or_create_company
from position.utils import get_or_insert_position
from position.models import PositionDetail
from utils import utils
from utils.error_codes import ResponseCodes
from utils.generic_json_creator import create_response
from .models import PositionApplication, Contact, ApplicationStatus, StatusHistory, Feedback, PositionApplicationNote
from .serializers import ApplicationStatusSerializer
from .serializers import PositionApplicationNoteSerializer
from .serializers import PositionApplicationSerializer, ContactSerializer
from .serializers import StatusHistorySerializer
from .serializers import FeedbackSerializer

User = get_user_model()


@csrf_exempt
@api_view(["GET", "POST", "PUT", "PATCH", "DELETE"])
def position_applications(request):
    body = request.data
    if 'recaptcha_token' in body and utils.verify_recaptcha(None, body['recaptcha_token'],
                                                            'add_job') == ResponseCodes.verify_recaptcha_failed:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.verify_recaptcha_failed),
                            safe=False)
    if request.method == "GET":
        timestamp = request.GET.get('timestamp')
        if timestamp is not None:
            timestamp = int(timestamp) / 1000
            if timestamp is None:
                return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters))
            profile = request.user
            time = dt.fromtimestamp(int(timestamp))
            user_job_apps = PositionApplication.objects.filter(
                created_date__gte=time)
            job_application_list = PositionApplicationSerializer(instance=user_job_apps, many=True, context={
                'user': request.user}).data
            response = {'data': job_application_list,
                        'synching': profile.synching}
            return JsonResponse(create_response(data=response), safe=False)
        status_id = request.GET.get('status_id')
        if status_id is not None:
            user_job_apps = PositionApplication.objects.filter(
                application_status__id=status_id, user__id=request.user.id, is_deleted=False).order_by('-apply_date')
        else:
            user_job_apps = PositionApplication.objects.filter(
                user_id=request.user.id, is_deleted=False).order_by('-apply_date')
        job_applications_list = PositionApplicationSerializer(instance=user_job_apps, many=True, context={
            'user': request.user}).data
        return JsonResponse(create_response(data=job_applications_list), safe=False)
    elif request.method == "POST": 
        position_id = body['position_id']
        company = body['company']
        application_date = body['application_date']
        status = int(body['status_id'])
        first_name = body['first_name']
        last_name = body['last_name']
        jt = PositionDetail.objects.get(pk=position_id)
        jc = get_or_create_company(company)
        job_application = PositionApplication(
            position=jt, company_object=jc, first_name=first_name, last_name=last_name, apply_date=application_date, user=request.user)
        job_application.application_status = ApplicationStatus.objects.get(
            pk=status)
        print('normal')
        job_application.save()
        return JsonResponse(
            create_response(
                data=PositionApplicationSerializer(instance=job_application, many=False, context={'user': request.user}).data),
            safe=False)
    elif request.method == "PUT":
        status_id = body.get('status_id')
        rejected = body.get('rejected')
        job_application_ids = []
        if 'jobapp_ids' in body:
            job_application_ids = body['jobapp_ids']
        if 'jobapp_id' in body:
            job_application_ids.append(body['jobapp_id'])
        if len(job_application_ids) == 0:
            return JsonResponse(create_response(success=False, error_code=ResponseCodes.record_not_found), safe=False)
        elif rejected is None and status_id is None:
            return JsonResponse(create_response(success=False, error_code=ResponseCodes.record_not_found), safe=False)
        else:
            user_job_apps = PositionApplication.objects.filter(
                pk__in=job_application_ids)
            if user_job_apps.count() == 0:
                return JsonResponse(create_response(success=False, error_code=ResponseCodes.record_not_found), safe=False)
            else:
                for user_job_app in user_job_apps:
                    if user_job_app.user == request.user:
                        if status_id is None:
                            user_job_app.is_rejected = rejected
                        else:
                            new_status = ApplicationStatus.objects.filter(
                                pk=status_id)
                            if new_status.count() == 0:
                                return JsonResponse(
                                    create_response(data=None, success=False,
                                                    error_code=ResponseCodes.invalid_parameters),
                                    safe=False)
                            else:
                                if rejected is None:
                                    user_job_app.application_status = new_status[0]
                                else:
                                    user_job_app.application_status = new_status[0]
                                    user_job_app.is_rejected = rejected
                                status_history = StatusHistory(
                                    pos_app=user_job_app, application_status=new_status[0])
                                status_history.save()
                        if rejected is not None:
                            user_job_app.rejected_date = timezone.now()
                        user_job_app.updated_date = timezone.now()
                        user_job_app.save()
                return JsonResponse(create_response(data=None), safe=False)
    elif request.method == "PATCH":
        job_app_id = body.get('jobapp_id')
        if job_app_id is None:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.record_not_found),
                                safe=False)
        user_job_app = PositionApplication.objects.get(pk=job_app_id)

        if user_job_app.user != request.user:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.record_not_found),
                                safe=False)

        job_title = body.get('job_title')
        company = body.get('company')
        application_date = body.get('application_date')
        source = body.get('source')

        if application_date is not None:
            user_job_app.apply_date = application_date
        if job_title is not None:
            user_job_app.position = get_or_insert_position(job_title)
        if company is not None:
            user_job_app.company_object = get_or_create_company(company)
        user_job_app.updated_date = timezone.now()
        user_job_app.save()
        return JsonResponse(create_response(
            data=PositionApplicationSerializer(instance=user_job_app, many=False, context={'user': request.user}).data),
            safe=False)
    elif request.method == "DELETE":
        job_application_ids = []
        if 'jobapp_ids' in body:
            job_application_ids = body['jobapp_ids']
        if 'jobapp_id' in body:
            job_application_ids.append(body['jobapp_id'])
        if len(job_application_ids) == 0 or PositionApplication.objects.filter(pk__in=job_application_ids).count() == 0:
            return JsonResponse(create_response(success=False, error_code=ResponseCodes.record_not_found), safe=False)
        else:
            user_job_apps = PositionApplication.objects.filter(
                pk__in=job_application_ids)
            for user_job_app in user_job_apps:
                if user_job_app.user == request.user:
                    user_job_app.deleted_date = timezone.now()
                    user_job_app.is_deleted = True
                    user_job_app.save()
            return JsonResponse(create_response(data=None), safe=False)


@csrf_exempt
@api_view(["GET"])
def statuses(request):
    statuses_list = ApplicationStatus.objects.all()
    statuses_list = ApplicationStatusSerializer(
        instance=statuses_list, many=True).data
    return JsonResponse(create_response(data=statuses_list), safe=False)


@csrf_exempt
@api_view(["GET"])
def status_history(request, pos_app_pk):
    if pos_app_pk is None:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters), safe=False)
    else:
        statuses_list = StatusHistory.objects.filter(pos_app__pk=pos_app_pk)
        statuses_list = StatusHistorySerializer(
            instance=statuses_list, many=True).data
        return JsonResponse(create_response(data=statuses_list), safe=False)


@csrf_exempt
@api_view(["GET", "POST", "PUT", "DELETE"])
def contacts(request, pos_app_pk):
    body = request.data
    if request.method == "GET":
        data = {}
        if pos_app_pk is None:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters), safe=False)
        else:
            contacts_list = Contact.objects.filter(pos_app_pk=pos_app_pk)
            contacts_list = ContactSerializer(
                instance=contacts_list, many=True).data

            data['contacts'] = contacts_list

            user_profile = request.user
            jobapp = PositionApplication.objects.get(pk=pos_app_pk)

        return JsonResponse(create_response(data=data, success=True, error_code=ResponseCodes.success), safe=False)
    elif request.method == "POST":
        first_name = body.get('first_name')
        last_name = body.get('last_name')
        if pos_app_pk is None or first_name is None or last_name is None:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                                safe=False)
        user_job_app = PositionApplication.objects.get(pk=pos_app_pk)
        if user_job_app.user == request.user:
            phone_number = body.get('phone_number')
            linkedin_url = body.get('linkedin_url')
            description = body.get('description')
            email = body.get('email')
            job_title = body.get('job_title')
            jt = None
            jc = None
            if job_title is not None:
                jt = get_or_insert_position(job_title)

            company = body.get('company')
            if company is not None:
                jc = get_or_create_company(company)

            contact = Contact(
                pos_app=user_job_app, first_name=first_name, last_name=last_name, phone_number=phone_number,
                linkedin_url=linkedin_url,
                description=description, email=email,
                position=jt, company=jc)
            contact.save()
            data = ContactSerializer(
                instance=contact, many=False).data
            return JsonResponse(create_response(data=data), safe=False)
        else:
            return JsonResponse(
                create_response(data=None, success=False,
                                error_code=ResponseCodes.record_not_found),
                safe=False)
    elif request.method == "PUT":
        contact_id = body.get('contact_id')
        if contact_id is None:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                                safe=False)
        contact = Contact.objects.get(pk=contact_id)
        if contact.pos_app.user == request.user:
            email = body.get('email')
            if email is not None:
                contact.email = email
            phone_number = body.get('phone_number')
            if phone_number is not None:
                contact.phone_number = phone_number
            linkedin_url = body.get('linkedin_url')
            if linkedin_url is not None:
                contact.linkedin_url = linkedin_url
            description = body.get('description')
            if description is not None:
                contact.description = description
            job_title = body.get('job_title')
            if job_title is not None:
                contact.position = get_or_insert_position(job_title)
            company = body.get('company')
            if company is not None:
                contact.company = get_or_create_company(company)

            contact.updated_date = timezone.now()
            contact.save()
            data = ContactSerializer(
                instance=contact, many=False).data
            return JsonResponse(create_response(data=data, success=True, error_code=ResponseCodes.success),
                                safe=False)
        else:
            return JsonResponse(
                create_response(data=None, success=False,
                                error_code=ResponseCodes.record_not_found),
                safe=False)
    elif request.method == "DELETE":
        contact_id = body.get('contact_id')
        if contact_id is None:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                                safe=False)
        user_job_app_contact = Contact.objects.filter(
            pk=contact_id)
        if user_job_app_contact.count() == 0:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.record_not_found),
                                safe=False)
        user_job_app_contact = user_job_app_contact[0]
        if user_job_app_contact.pos_app.user == request.user:
            user_job_app_contact.delete()
            return JsonResponse(create_response(data=None, success=True, error_code=ResponseCodes.success), safe=False)
        else:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.record_not_found),
                                safe=False)


@csrf_exempt
@api_view(["GET", "POST", "PUT", "DELETE"])
def notes(request, pos_app_pk):
    body = request.data
    if 'recaptcha_token' in body and utils.verify_recaptcha(None, body['recaptcha_token'],
                                                            'jobapp_note') == ResponseCodes.verify_recaptcha_failed:
        return JsonResponse(
            create_response(data=None, success=False,
                            error_code=ResponseCodes.verify_recaptcha_failed),
            safe=False)
    if request.method == "GET":
        if pos_app_pk is None:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                                safe=False)
        else:
            notes_list = PositionApplicationNote.objects.filter(
                pos_app__pk=pos_app_pk).order_by('-updated_date', '-created_date')
            notes_list = PositionApplicationNoteSerializer(
                instance=notes_list, many=True).data
            return JsonResponse(create_response(data=notes_list, success=True, error_code=ResponseCodes.success),
                                safe=False)
    elif request.method == "POST":
        description = body['description']
        if pos_app_pk is None or description is None:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                                safe=False)
        else:
            user_job_app = PositionApplication.objects.get(pk=pos_app_pk)
            if user_job_app.user == request.user:
                note = PositionApplicationNote(
                    pos_app=user_job_app, description=description)
                note.save()
                data = PositionApplicationNoteSerializer(
                    instance=note, many=False).data
                return JsonResponse(create_response(data=data, success=True, error_code=ResponseCodes.success),
                                    safe=False)
            else:
                return JsonResponse(
                    create_response(data=None, success=False, error_code=ResponseCodes.record_not_found), safe=False)
    elif request.method == "PUT":
        jobapp_note_id = body['jobapp_note_id']
        description = body['description']
        if jobapp_note_id is None:
            return JsonResponse(
                create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters), safe=False)
        else:
            note = PositionApplicationNote.objects.get(pk=jobapp_note_id)
            if note.pos_app.user == request.user:
                note.description = description
                note.updated_date = timezone.now()
                note.save()
                data = PositionApplicationNoteSerializer(
                    instance=note, many=False).data
                return JsonResponse(create_response(data=data, success=True, error_code=ResponseCodes.success),
                                    safe=False)
            else:
                return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.record_not_found),
                                    safe=False)
    elif request.method == "DELETE":
        jobapp_note_id = body['jobapp_note_id']
        if jobapp_note_id is None:
            return JsonResponse(
                create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters), safe=False)
        else:
            user_job_app_note = PositionApplicationNote.objects.get(
                pk=jobapp_note_id)
            if user_job_app_note.pos_app.user == request.user:
                user_job_app_note.delete()
                return JsonResponse(create_response(data=None, success=True, error_code=ResponseCodes.success), safe=False)
            else:
                return JsonResponse(
                    create_response(data=None, success=False,
                                    error_code=ResponseCodes.record_not_found),
                    safe=False)


@csrf_exempt
@api_view(["GET", "POST", "PUT", "DELETE"])
def feedbacks(request, pos_app_pk):
    body = request.data
    if request.method == "GET":
        if pos_app_pk is None:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                                safe=False)
        else:
            feedbacks_list = Feedback.objects.filter(
                pos_app__pk=pos_app_pk).order_by('-updated_date', '-created_date')
            feedbacks_list = FeedbackSerializer(
                instance=feedbacks_list, many=True).data
            return JsonResponse(create_response(data=feedbacks_list, success=True, error_code=ResponseCodes.success),
                                safe=False)
    elif request.method == "POST":
        if pos_app_pk is None:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                                safe=False)
        else:
            pos_app = PositionApplication.objects.get(pk=pos_app_pk)
            interviewer = body.get('interviewer')
            interview_round = body.get('interview_round')
            rate = body.get('rate')
            description = body.get('description')
            interview_date = body.get('interview_date')
            feedback = Feedback(pos_app=pos_app, interviewer=interviewer, interview_round=interview_round,
                                rate=rate, description=description, interview_date=interview_date)
            feedback.save()
            data = FeedbackSerializer(instance=feedback, many=False).data
            return JsonResponse(create_response(data=data, success=True, error_code=ResponseCodes.success), safe=False)
    elif request.method == "PUT":
        if pos_app_pk is None:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                                safe=False)
        else:
            feedback_id = body.get('feedback_id')
            if feedback_id is None:
                return JsonResponse(
                    create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters), safe=False)
            else:
                interviewer = body.get('interviewer')
                interview_round = body.get('interview_round')
                rate = body.get('rate')
                description = body.get('description')
                interview_date = body.get('interview_date')
                feedback = Feedback.objects.get(pk=feedback_id)
                if interviewer is not None:
                    feedback.interviewer = interviewer
                if interview_round is not None:
                    feedback.interview_round = interview_round
                if rate is not None:
                    feedback.rate = rate
                if description is not None:
                    feedback.description = description
                if interview_date is not None:
                    feedback.interview_date = interview_date
                feedback.save()
                data = FeedbackSerializer(instance=feedback, many=False).data
                return JsonResponse(create_response(data=data, success=True, error_code=ResponseCodes.success), safe=False)
    elif request.method == "DELETE":
        feedback_id = body.get('feedback_id')
        if feedback_id is None:
            return JsonResponse(
                create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters), safe=False)
        else:
            feedback = Feedback.objects.get(pk=feedback_id)
            feedback.delete()
            return JsonResponse(create_response(data=None, success=True, error_code=ResponseCodes.success), safe=False)
