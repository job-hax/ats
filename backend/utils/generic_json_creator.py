from utils.error_codes import ResponseCodes


def create_response(data=None, success=True, paginator=None, error_code=ResponseCodes.success):
    response = {'success': success, 'error_code': int(error_code.value), 'error_message': get_error_message(error_code)}
    if paginator is not None:
        response['pagination'] = {}
        response['pagination']['current_page'] = paginator.page.number
        response['pagination']['page_count'] = paginator.page.paginator.num_pages
        response['pagination']['total_count'] = paginator.page.paginator.count
    if not success:
        response['data'] = None
    else:
        response['data'] = data
    return response


def get_error_message(error_code):
    if error_code == ResponseCodes.success:
        return ''
    if error_code == ResponseCodes.invalid_credentials:
        return 'Invalid credentials'
    elif error_code == ResponseCodes.user_profile_not_found:
        return 'User profile not found.'
    elif error_code == ResponseCodes.email_verification_required:
        return 'Email verification required.'
    elif error_code == ResponseCodes.email_already_verified:
        return 'Email already verified.'
    elif error_code == ResponseCodes.activation_key_expired:
        return 'Activation key expired.'
    elif error_code == ResponseCodes.couldnt_update_google_token:
        return 'Error occured while updating the google token.'
    elif error_code == ResponseCodes.google_token_expired:
        return 'Google token has expired. Please refresh Google token.'
    elif error_code == ResponseCodes.couldnt_logout_user:
        return 'Couldnt logout user...'
    elif error_code == ResponseCodes.couldnt_login:
        return 'Could not login... Please check your credentials...'
    elif error_code == ResponseCodes.passwords_do_not_match:
        return 'Passwords do not match'
    elif error_code == ResponseCodes.username_exists:
        return 'This username is taken'
    elif error_code == ResponseCodes.email_exists:
        return 'This email is being used'
    elif error_code == ResponseCodes.invalid_parameters:
        return 'Invalid parameters...'
    elif error_code == ResponseCodes.record_not_found:
        return 'Record not found...'
    elif error_code == ResponseCodes.poll_couldnt_found:
        return 'Poll could not be found...'
    elif error_code == ResponseCodes.missing_item_id_parameter:
        return 'Missing item_id parameter...'
    elif error_code == ResponseCodes.poll_answer_couldnt_found:
        return 'Poll answer could not be found...'
    elif error_code == ResponseCodes.blog_couldnt_found:
        return 'Blog could not be found...'
    elif error_code == ResponseCodes.invalid_username:
        return 'Invalid username...'
    elif error_code == ResponseCodes.account_already_linked:
        return 'Account already linked...'
    elif error_code == ResponseCodes.not_supported_user:
        return 'User not supported for this action...'
    elif error_code == ResponseCodes.verify_recaptcha_failed:
        return 'You didn\'t pass reCAPTCHA challenge! You\'ll need to sigin again!'
    return 'Unknown error'
