from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from users import views

urlpatterns = [
    path('authSocialUser/', views.auth_social_user),
    path('register/', views.register),
    path('login/', views.login),
    path('refreshToken/', views.refresh_token),
    path('linkSocialAccount/', views.link_social_account),
    path('logout/', views.logout),
    path('updateGmailToken/', views.update_gmail_token),
    path('activate/', views.activate_user),
    path('sendActivationCode/', views.send_activation_code),
    path('forgotPassword/', views.forgot_password),
    path('validateForgotPassword/', views.validate_forgot_password),
    path('resetPassword/', views.reset_password),
    path('changePassword/', views.change_password),
    path('updateProfilePhoto/', views.update_profile_photo),
    path('employmentStatuses/', views.employment_statuses),
    path('profile/', views.get_profile),
    path('updateProfile/', views.update_profile),
    path('feedback/', views.feedback),
    path('deleteUser/', views.delete_user),
    path('verifyRecaptcha/', views.verify_recaptcha),
]
urlpatterns = format_suffix_patterns(urlpatterns)
