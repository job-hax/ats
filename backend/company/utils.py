from company.models import Company
from utils.clearbit_company_checker import get_company_detail
import os
import uuid
from django.core.files import File
from urllib.request import urlretrieve
from urllib.error import HTTPError
from background_task import background


def get_or_create_company(name):
    cd = get_company_detail(name)
    if cd is None:
        company_title = name
    else:
        company_title = cd['name']
    jc = Company.objects.all().filter(company__iexact=company_title)
    if jc.count() == 0:
        # if company doesnt exist save it
        if cd is None:
            jc = Company(company=name, domain=None)
        else:
            jc = Company(company=cd['name'], domain=cd['domain'])
            jc.save()
            if 'logo' in cd and cd['logo'] is not None and cd['logo'] is not '':
                try:
                    urlretrieve(cd['logo'], filename=cd['logo'].split('/')[-1])
                    file = open(cd['logo'].split('/')[-1], 'rb')
                    filename = "%s.%s" % (uuid.uuid4(), 'jpg')
                    jc.logo.save(filename, File(file), save=True)
                    jc.save()
                    os.remove(cd['logo'].split('/')[-1])
                except FileNotFoundError as err:
                    pass  # something wrong with local path
                except HTTPError as err:
                    pass  # something wrong with url
        jc.save()
    else:
        jc = jc[0]
    if jc.location_address is None:
        fetch_company_location(name)
    return jc


@background(schedule=3)
def fetch_company_location(query):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json?"
    api_key = os.environ.get('JOBHAX_BACKEND_MAPS_API_KEY', '')
    if api_key is not '':
        log('Looking location of ' + query, 'e')
        if query is not None:
            r = requests.get(url + 'query=' + query +
                             '&key=' + api_key)
            x = r.json()
            y = x['results']
            for i in range(len(y)):
                place = y[i]
                if 'establishment' in place['types']:
                    lat = place['geometry']['location']['lat']
                    lng = place['geometry']['location']['lng']
                    formatted_address = place['formatted_address']
                    company = Company.objects.get(company=query)
                    company.location_lat = lat
                    company.location_lon = lng
                    company.location_address = formatted_address
                    company.save()
                    break
