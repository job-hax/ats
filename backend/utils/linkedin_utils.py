import json
import os
import traceback
from django.conf import settings

import requests
from bs4 import BeautifulSoup as bs

from utils.logger import log
from .gmail_utils import find_nth


def parse_job_detail(body):
    """Parse html body and get job posting details
    Args:
      body: email html body
    Returns:
      String values which represent details of job post in JSON format.
    """
    try:
        link = body[find_nth(body, 'https://www.linkedin.com/comm/jobs/view/', 1): find_nth(body, '?trk', 1)]
        url = requests.get(link)
        html_text = url.text
        s = find_nth(html_text, '<code id="viewJobMetaTagModule">', 1)
        e = html_text.rfind('--></code>') + 10
        plain_data = html_text[s: e]
        plain_data = plain_data.replace('<!--', '')
        plain_data = plain_data.replace('-->', '')
        soup = bs(plain_data, "html.parser")
        try:
            poster_information = soup.find('code', id='posterInformationModule')
            poster_information_json = poster_information.getText()
        except:
            poster_information_json = '{}'
        try:
            decorated_job_posting = soup.find('code', id='decoratedJobPostingModule')
            decorated_job_posting_json = decorated_job_posting.getText()
        except:
            decorated_job_posting_json = '{}'
        try:
            top_card_v2 = soup.find('code', id='topCardV2Module')
            top_card_v2_json = top_card_v2.getText()
        except:
            top_card_v2_json = '{}'

        return poster_information_json, decorated_job_posting_json, top_card_v2_json
    except Exception as e:
        log(traceback.format_exception(None, e, e.__traceback__), 'e')
        return '{}', '{}', '{}'


def get_access_token_with_code(code):
    try:
        if settings.DEBUG:
            redirect_uri = 'http://localhost:8080/action-linkedin-oauth2'
        else:
            redirect_uri = 'https://' + settings.SITE_URL + '/action-linkedin-oauth2'
        post_data = {'grant_type': 'authorization_code', 'code': code,
                     'redirect_uri': redirect_uri,
                     'client_id': os.environ.get('JOBHAX_LINKEDIN_CLIENT_KEY', ''),
                     'client_secret': os.environ.get('JOBHAX_LINKEDIN_CLIENT_SECRET', '')}
        log(post_data, 'e')
        response = requests.post('https://www.linkedin.com/uas/oauth2/accessToken',
                                 data=post_data, headers={'content-type': 'application/x-www-form-urlencoded'})
        json_res = json.loads(response.text)
        log(json_res, 'e')
        return json_res['access_token']
    except Exception as e:
        log(traceback.format_exception(None, e, e.__traceback__), 'e')
        return None
