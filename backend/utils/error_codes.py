from enum import Enum


class ResponseCodes(Enum):
    success = 0
    invalid_credentials = 1
    user_profile_not_found = 2
    couldnt_update_google_token = 3
    google_token_expired = 4
    couldnt_logout_user = 5
    couldnt_login = 6
    passwords_do_not_match = 7
    username_exists = 8
    email_exists = 9
    invalid_parameters = 10
    record_not_found = 11
    invalid_username = 12
    email_verification_required = 13
    email_already_verified = 14
    activation_key_expired = 15
    account_already_linked = 16
    not_supported_user = 17
    verify_recaptcha_failed = 99
    poll_couldnt_found = 101
    missing_item_id_parameter = 102
    poll_answer_couldnt_found = 103
    blog_couldnt_found = 104
