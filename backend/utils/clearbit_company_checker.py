import os
import traceback

import requests

from utils.logger import log


def get_company_detail(name):
    try:
        token = os.environ.get('JOBHAX_CLEARBIT_KEY', '')
        r = requests.get('https://company.clearbit.com/v1/domains/find?name=' + name,
                         headers={'Authorization': 'Bearer ' + token})
        data = r.json()
        if 'error' not in data:
            return data
        else:
            return None
    except Exception as e:
        log(traceback.format_exception(None, e, e.__traceback__), 'e')
        return None
