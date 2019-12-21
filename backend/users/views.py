import json
import traceback
import uuid
from datetime import datetime

import requests
from background_task import background
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from oauth2_provider.models import AccessToken
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from social_django.models import UserSocialAuth
from college.models import College
from company.utils import get_or_create_company
from major.utils import insert_or_update_major
from position.utils import get_or_insert_position
from utils import utils
from utils.error_codes import ResponseCodes
from utils.generic_json_creator import create_response
from utils.linkedin_utils import get_access_token_with_code
from utils.logger import log
from utils.models import Country, State
from utils.utils import send_notification_email_to_admins, get_boolean_from_request
from .models import EmploymentStatus, UserType
from .models import Feedback
from .serializers import EmploymentStatusSerializer, UserTypeSerializer
from .serializers import ProfileSerializer, UserSerializer

User = get_user_model()


@require_POST
@csrf_exempt
def register(request):
    # Get form values
    body = JSONParser().parse(request)
    if 'recaptcha_token' in body and utils.verify_recaptcha(None, body['recaptcha_token'],
                                                            'signup') == ResponseCodes.verify_recaptcha_failed:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.verify_recaptcha_failed),
                            safe=False)

    first_name = ''
    last_name = ''
    linkedin_auth_code = None
    google_access_token = None
    if 'first_name' in body:
        first_name = body['first_name']
    if 'last_name' in body:
        last_name = body['last_name']
    if 'linkedin_auth_code' in body:
        linkedin_auth_code = body['linkedin_auth_code']
    if 'google_access_token' in body:
        google_access_token = body['google_access_token']
    user_type, new = UserType.objects.get_or_create(name__iexact='Employer')    
    username = body['username']
    email = body['email']
    password = body['password']
    password2 = body['password2']

    if '@' in username:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_username),
                            safe=False)

    # Check if passwords match
    if password == password2:
        # Check username
        if User.objects.filter(username__iexact=username).exists():
            success = False
            code = ResponseCodes.username_exists
        else:
            if User.objects.filter(email__iexact=email).exists():
                success = False
                code = ResponseCodes.email_exists
            else:
                # Looks good
                user = User.objects.create_user(username=username, password=password, email=email,
                                                first_name=first_name, user_type=user_type,
                                                last_name=last_name, approved=False, activation_key=None,
                                                key_expires=None)
                user.save()
                if linkedin_auth_code is None and google_access_token is None:
                    activation_key, expiration_time = utils.generate_activation_key_and_expiredate(
                        body['username'])
                    user.activation_key = activation_key
                    user.key_expires = expiration_time
                    user.save()
                    utils.send_email(user.email,
                                     activation_key, 'activate')

                    post_data = {'client_id': body['client_id'], 'client_secret': body['client_secret'],
                                 'grant_type': 'password',
                                 'username': username, 'password': password}

                    response = requests.post('http://localhost:8001/auth/token', data=json.dumps(
                        post_data), headers={'content-type': 'application/json'})
                    json_res = json.loads(response.text)
                    if 'error' in json_res:
                        success = False
                        code = ResponseCodes.couldnt_login
                    else:
                        success = True
                        code = ResponseCodes.success
                        json_res['user_type'] = UserTypeSerializer(instance=user.user_type, many=False).data
                        json_res['signup_flow_completed'] = user.signup_flow_completed
                    return JsonResponse(create_response(data=json_res, success=success, error_code=code), safe=False)
                else:
                    post_data = {'client_id': body['client_id'], 'client_secret': body['client_secret'],
                                 'grant_type': 'convert_token'}
                    if linkedin_auth_code is not None:
                        post_data['backend'] = 'linkedin-oauth2'
                        post_data['token'] = get_access_token_with_code(body['linkedin_auth_code'])
                    else:
                        post_data['backend'] = 'google-oauth2'
                        post_data['token'] = body['google_access_token']
                    response = requests.post('http://localhost:8001/auth/convert-token',
                                             data=json.dumps(post_data), headers={'content-type': 'application/json'})
                    jsonres = json.loads(response.text)
                    log(jsonres, 'e')
                    if 'error' in jsonres:
                        success = False
                        code = ResponseCodes.invalid_credentials
                    else:
                        social_user = UserSocialAuth.objects.get(extra_data__icontains=post_data['token'])

                        if social_user.user.email != user.email:
                            social_user.user.delete()

                        social_user.user = user
                        social_user.save()

                        success = True
                        code = ResponseCodes.success
                        user = AccessToken.objects.get(token=jsonres['access_token']).user
                        jsonres['user_type'] = UserTypeSerializer(instance=user.user_type, many=False).data
                        jsonres['signup_flow_completed'] = user.signup_flow_completed
                        user.approved = True
                        user.save()
                    return JsonResponse(create_response(data=jsonres, success=success, error_code=code), safe=False)
    else:
        success = False
        code = ResponseCodes.passwords_do_not_match
    return JsonResponse(create_response(data=None, success=success, error_code=code), safe=False)


@require_GET
@csrf_exempt
def activate_user(request):
    try:
        user = User.objects.filter(activation_key=request.GET.get('code'))
        if user.count() == 0:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                                safe=False)
        user = user[0]
        if not user.approved:
            if user.key_expires is None or timezone.now() > user.key_expires:
                return JsonResponse(
                    create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters), safe=False)
            else:  # Activation successful
                user.approved = True
                user.activation_key = None
                user.key_expires = None
                user.save()
                return JsonResponse(create_response(data=None, success=True, error_code=ResponseCodes.success),
                                    safe=False)
        # If user is already active, simply display error message
        else:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.email_already_verified),
                                safe=False)
    except Exception as e:
        log(traceback.format_exception(None, e, e.__traceback__), 'e')
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                            safe=False)


@require_POST
@csrf_exempt
def send_activation_code(request):
    body = JSONParser().parse(request)
    user = authenticate(username=body['username'], password=body['password'])
    if user is not None:
        if user.approved:
            return JsonResponse(
                create_response(data=None, success=False, error_code=ResponseCodes.email_already_verified), safe=False)
        else:
            activation_key, expiration_time = utils.generate_activation_key_and_expiredate(
                body['username'])
            user.activation_key = activation_key
            user.key_expires = expiration_time
            user.save()
            utils.send_email(user.email, activation_key, 'activate')
            return JsonResponse(create_response(data=None, success=True), safe=False)
    else:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_credentials),
                            safe=False)


@require_POST
@csrf_exempt
def forgot_password(request):
    body = JSONParser().parse(request)
    if 'recaptcha_token' in body and utils.verify_recaptcha(None, body['recaptcha_token'],
                                                            'forgot_password') == ResponseCodes.verify_recaptcha_failed:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.verify_recaptcha_failed),
                            safe=False)

    username = body['username']
    try:
        user = User.objects.get(
            Q(username__iexact=username) | Q(email__iexact=username))
        activation_key, expiration_time = utils.generate_activation_key_and_expiredate(
            user.username)
        user.forgot_password_key = activation_key
        user.forgot_password_key_expires = expiration_time
        user.save()
        utils.send_email(user.email, activation_key,
                         'validateForgotPassword')
    except Exception as e:
        log(traceback.format_exception(None, e, e.__traceback__), 'e')
    return JsonResponse(create_response(data=None, success=True), safe=False)


@require_GET
@csrf_exempt
def validate_forgot_password(request):
    try:
        user = User.objects.filter(forgot_password_key=request.GET.get('code'))
        if user.count() == 0:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                                safe=False)
        user = user[0]
        if user.forgot_password_key_expires is None or timezone.now() > user.forgot_password_key_expires:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                                safe=False)
        else:
            return JsonResponse(create_response(data=None, success=True, error_code=ResponseCodes.success), safe=False)
    except Exception as e:
        log(traceback.format_exception(None, e, e.__traceback__), 'e')
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                            safe=False)


@require_POST
@csrf_exempt
def reset_password(request):
    body = JSONParser().parse(request)
    password = body['password']
    code = body['code']
    user = User.objects.filter(forgot_password_key=code)
    if user.count() == 0:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_credentials),
                            safe=False)
    user = user[0]
    user.forgot_password_key = None
    user.forgot_password_key_expires = None
    user.set_password(password)
    user.save()
    return JsonResponse(create_response(data=None), safe=False)


@require_POST
@csrf_exempt
def login(request):
    body = JSONParser().parse(request)

    post_data = {'client_id': body['client_id'], 'client_secret': body['client_secret'], 'grant_type': 'password',
                 'username': body['username'], 'password': body['password']}
    user = authenticate(username=body['username'], password=body['password'])
    if user is None:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_credentials),
                            safe=False)
    # if not user.approved:
    #    return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.email_verification_required), safe=False)
    if 'recaptcha_token' in body and utils.verify_recaptcha(user.email, body['recaptcha_token'],
                                                            'signin') == ResponseCodes.verify_recaptcha_failed:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.verify_recaptcha_failed),
                            safe=False)

    response = requests.post('http://localhost:8001/auth/token', data=json.dumps(
        post_data), headers={'content-type': 'application/json'})
    json_res = json.loads(response.text)
    if 'error' in json_res:
        success = False
        code = ResponseCodes.couldnt_login
    else:
        success = True
        code = ResponseCodes.success
        json_res['user_type'] = UserTypeSerializer(instance=user.user_type, many=False).data
        json_res['signup_flow_completed'] = user.signup_flow_completed
    return JsonResponse(create_response(data=json_res, success=success, error_code=code), safe=False)


@require_POST
@csrf_exempt
def logout(request):
    body = JSONParser().parse(request)
    post_data = {'token': body['token'], 'client_id': body['client_id'],
                 'client_secret': body['client_secret']}
    headers = {'content-type': 'application/json'}
    response = requests.post('http://localhost:8001/auth/revoke-token',
                             data=json.dumps(post_data), headers=headers)
    if response.status_code is 204 or response.status_code is 200:
        success = True
        code = ResponseCodes.success
    else:
        success = False
        code = ResponseCodes.couldnt_logout_user
    return JsonResponse(create_response(data=None, success=success, error_code=code), safe=False)


@csrf_exempt
@api_view(["POST"])
def change_password(request):
    body = request.data
    password = body['password']
    user = request.user
    user.set_password(password)
    user.save()
    return JsonResponse(create_response(data=None), safe=False)


@csrf_exempt
@api_view(["POST"])
def update_profile_photo(request):
    body = request.data
    user = request.user
    if 'photo_url' in body:
        utils.save_image_file_to_user(body['photo_url'], user)
    if 'photo' in body:
        f = request.data['photo']
        ext = f.name.split('.')[-1]
        filename = "%s.%s" % (uuid.uuid4(), ext)
        user.profile_photo.save(filename, f, save=True)
    user.save()
    return JsonResponse(create_response(data=ProfileSerializer(instance=user, many=False).data), safe=False)


@csrf_exempt
@api_view(["POST"])
def update_profile(request):
    body = request.data
    if 'recaptcha_token' in body and utils.verify_recaptcha(request.user.email, body['recaptcha_token'],
                                                            'update_profile') == ResponseCodes.verify_recaptcha_failed:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.verify_recaptcha_failed),
                            safe=False)

    user = request.user
    if 'password' in body:
        user.set_password(body['password'])
    if 'username' in body:
        if User.objects.filter(username=body['username']).exists():
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.username_exists),
                                safe=False)
        user.username = body['username']
    if 'first_name' in body:
        user.first_name = body['first_name']
    if 'last_name' in body:
        user.last_name = body['last_name']
    if 'gender' in body:
        user.gender = body['gender']
    if 'dob' in body:
        user.dob = datetime.strptime(body['dob'], "%Y-%m-%d").date()
    if 'student_email' in body:
        user.student_email = body['student_email']
    if 'is_email_public' in body:
        user.is_email_public = body['is_email_public']
    if 'phone_number' in body:
        user.phone_number = body['phone_number']
    if 'emp_status_id' in body:
        if EmploymentStatus.objects.filter(pk=body['emp_status_id']).count() > 0:
            user.emp_status = EmploymentStatus.objects.get(
                pk=body['emp_status_id'])
    user_type, new = UserType.objects.get_or_create(name__iexact='Employer')     
    
    if 'college_id' in body:
        if College.objects.filter(pk=body['college_id']).count() > 0:
            user.college = College.objects.get(
                pk=body['college_id'])
    if 'major' in body:
        user.major = insert_or_update_major(body['major'])
    if 'grad_year' in body:
        user.grad_year = body['grad_year']
    if 'job_title' in body:
        job_title = body['job_title']
        user.job_position = get_or_insert_position(job_title)
    if 'company' in body:
        company = body['company']
        user.company = get_or_create_company(company)

    if 'country_id' in body and 'state_id' in body:
        state = State.objects.get(pk=body['state_id'])
        if state.country.id != body['country_id']:
            return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.invalid_parameters),
                                safe=False)
        country = Country.objects.get(pk=body['country_id'])
        user.country = country
        user.state = state

    user.signup_flow_completed = True
    user.save()
    return JsonResponse(create_response(data=ProfileSerializer(instance=user, many=False).data), safe=False)


@csrf_exempt
@api_view(["POST"])
def link_social_account(request):
    body = request.data
    if 'recaptcha_token' in body and utils.verify_recaptcha(None, body['recaptcha_token'],
                                                            'signin') == ResponseCodes.verify_recaptcha_failed:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.verify_recaptcha_failed),
                            safe=False)

    post_data = {'client_id': body['client_id'], 'client_secret': body['client_secret'], 'grant_type': 'convert_token'}
    provider = body['provider']
    post_data['backend'] = provider
    if provider == 'linkedin-oauth2':
        if request.user.social_auth.filter(provider='linkedin-oauth2').count() == 0:
            post_data['token'] = get_access_token_with_code(body['token'])
        else:
            return JsonResponse(
                create_response(data=None, success=False, error_code=ResponseCodes.account_already_linked), safe=False)
    else:
        if request.user.social_auth.filter(provider='google-oauth2').count() == 0:
            post_data['token'] = body['token']
        else:
            return JsonResponse(
                create_response(data=None, success=False, error_code=ResponseCodes.account_already_linked), safe=False)
    response = requests.post('http://localhost:8001/auth/convert-token',
                             data=json.dumps(post_data), headers={'content-type': 'application/json'})
    json_res = json.loads(response.text)
    log(json_res, 'e')
    if 'error' in json_res:
        success = False
        code = ResponseCodes.invalid_credentials
    else:
        social_user = UserSocialAuth.objects.get(extra_data__icontains=post_data['token'])

        if social_user.user.email != request.user.email:
            social_user.user.delete()

        social_user.user = request.user
        social_user.save()

        post_data = {'token': json_res['access_token'], 'client_id': body['client_id'],
                     'client_secret': body['client_secret']}
        headers = {'content-type': 'application/json'}
        response = requests.post('http://localhost:8001/auth/revoke-token',
                                 data=json.dumps(post_data), headers=headers)

        log(str(response), 'e')
        if provider == 'google-oauth2':
            request.user.is_gmail_read_ok = True
            request.user.save()
        return JsonResponse(create_response(data=ProfileSerializer(instance=request.user, many=False).data), safe=False)
    return JsonResponse(create_response(data=None, success=success, error_code=code), safe=False)


@require_POST
@csrf_exempt
def auth_social_user(request):
    body = JSONParser().parse(request)
    if 'recaptcha_token' in body and utils.verify_recaptcha(None, body['recaptcha_token'],
                                                            'signin') == ResponseCodes.verify_recaptcha_failed:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.verify_recaptcha_failed),
                            safe=False)

    post_data = {'client_id': body['client_id'], 'client_secret': body['client_secret'], 'grant_type': 'convert_token'}
    provider = body['provider']
    post_data['backend'] = provider
    if provider == 'linkedin-oauth2':
        post_data['token'] = get_access_token_with_code(body['token'])
    else:
        post_data['token'] = body['token']
    response = requests.post('http://localhost:8001/auth/convert-token',
                             data=json.dumps(post_data), headers={'content-type': 'application/json'})
    json_res = json.loads(response.text)
    log(json_res, 'e')
    if 'error' in json_res:
        success = False
        code = ResponseCodes.invalid_credentials
    else:
        success = True
        code = ResponseCodes.success
        user = AccessToken.objects.get(token=json_res['access_token']).user
        if user.user_type is None:
            user.user_type, new = UserType.objects.get_or_create(name__iexact='Employer')
        json_res['user_type'] = UserTypeSerializer(instance=user.user_type, many=False).data
        json_res['signup_flow_completed'] = user.signup_flow_completed
        user.approved = True
        user.save()
        if provider == 'google-oauth2':
            user.is_gmail_read_ok = True
            user.save()
    return JsonResponse(create_response(data=json_res, success=success, error_code=code), safe=False)

@require_POST
@csrf_exempt
def refresh_token(request):
    body = JSONParser().parse(request)
    post_data = {'client_id': body['client_id'], 'client_secret': body['client_secret'], 'grant_type': 'refresh_token',
                 'refresh_token': body['refresh_token']}
    response = requests.post('http://localhost:8001/auth/token', data=json.dumps(
        post_data), headers={'content-type': 'application/json'})
    json_res = json.loads(response.text)
    if 'error' in json_res:
        success = False
        code = ResponseCodes.invalid_credentials
    else:
        success = True
        code = ResponseCodes.success
    return JsonResponse(create_response(data=json_res, success=success, error_code=code), safe=False)


@csrf_exempt
@api_view(["GET"])
def get_profile(request):
    basic = get_boolean_from_request(request, 'basic')
    if basic:
        return JsonResponse(create_response(data=UserSerializer(instance=request.user, context={'detailed': True}, many=False).data), safe=False)
    else:
        return JsonResponse(create_response(data=ProfileSerializer(instance=request.user, many=False).data), safe=False)


@csrf_exempt
@api_view(["GET"])
def employment_statuses(request):
    statuses = EmploymentStatus.objects.all()
    return JsonResponse(create_response(data=EmploymentStatusSerializer(instance=statuses, many=True).data), safe=False)


@csrf_exempt
@api_view(["DELETE"])
def delete_user(request):
    request.user.delete()
    return JsonResponse(create_response(data=None), safe=False)


@api_view(["POST"])
@csrf_exempt
def update_gmail_token(request):
    body = request.data
    token = body['token']
    try:
        user_profile = UserSocialAuth.objects.get(user=request.user)
        if user_profile is not None:
            user_profile.extra_data['access_token'] = token
            user_profile.save()
            success = True
            request.user.is_gmail_read_ok = True
            request.user.save()
            code = ResponseCodes.success
        else:
            success = False
            code = ResponseCodes.user_profile_not_found
    except Exception as e:
        log(traceback.format_exception(None, e, e.__traceback__), 'e')
        success = False
        code = ResponseCodes.couldnt_update_google_token
    return JsonResponse(create_response(data=None, success=success, error_code=code), safe=False)


@csrf_exempt
@api_view(["POST"])
def feedback(request):
    body = request.data
    if 'recaptcha_token' in body and utils.verify_recaptcha(request.user.email, body['recaptcha_token'],
                                                            'feedback') == ResponseCodes.verify_recaptcha_failed:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.verify_recaptcha_failed),
                            safe=False)

    text = body['text']
    star = body['star']
    user = request.user
    if user.username.startswith('demo'):
        from_demo_account = True
    else:
        from_demo_account = False
    Feedback.objects.create(user=user, text=text, star=star, from_demo_account=from_demo_account)
    send_notification_email_to_admins('feedback')
    return JsonResponse(create_response(data=None), safe=False)


@csrf_exempt
@api_view(["POST"])
def verify_recaptcha(request):
    body = request.data
    if 'recaptcha_token' not in body or 'action' not in body:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.verify_recaptcha_failed),
                            safe=False)
    elif utils.verify_recaptcha(request.user.email, body['recaptcha_token'],
                                body['action']) == ResponseCodes.verify_recaptcha_failed:
        return JsonResponse(create_response(data=None, success=False, error_code=ResponseCodes.verify_recaptcha_failed),
                            safe=False)
    else:
        return JsonResponse(create_response(data=None, success=True), safe=False)
