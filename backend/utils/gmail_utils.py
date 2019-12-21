from datetime import datetime

from dateutil import tz


def remove_html_tags(string):
    string = string.replace('\\r', '')
    string = string.replace('\\t', '')
    string = string.replace('\\n', '')
    string = string.replace('<br>', '')
    return string


def convert_time(base):
    # METHOD 2: Auto-detect zones:
    from_zone = tz.tzutc()
    to_zone = tz.tzlocal()

    # utc = datetime.utcnow()
    # utc = datetime.strptime('2011-01-21 02:37:21', '%Y-%m-%d %H:%M:%S')
    base = base[:25].strip()
    utc = datetime.strptime(base, '%a, %d %b %Y %H:%M:%S')
    # Mon, 1 Oct 2018 22:35:03 +0000 (UTC)

    # Tell the datetime object that it's in UTC time zone since
    # datetime objects are 'naive' by default
    utc = utc.replace(tzinfo=from_zone)

    # Convert time zone
    central = utc.astimezone(to_zone)
    return central
    # return central.strftime('%Y-%m-%d')
    # return central.strftime('%a, %d %b %Y %H:%M:%S %z')


def find_nth(string, substring, n):
    try:
        if (n == 1):
            return string.find(substring)
        else:
            return string.find(substring, find_nth(string, substring, n - 1) + 1)
    except:
        return -1


def unicode_to_ascii(text):
    TEXT = (text.
            replace('\\xe2\\x80\\x99', "'").
            replace('\\xc3\\xa9', 'e').
            replace('\\xe2\\x80\\x90', '-').
            replace('\\xe2\\x80\\x91', '-').
            replace('\\xe2\\x80\\x92', '-').
            replace('\\xe2\\x80\\x93', '-').
            replace('\\xe2\\x80\\x94', '-').
            replace('\\xe2\\x80\\x94', '-').
            replace('\\xe2\\x80\\x98', "'").
            replace('\\xe2\\x80\\x9b', "'").
            replace('\\xe2\\x80\\x9c', '"').
            replace('\\xe2\\x80\\x9c', '"').
            replace('\\xe2\\x80\\x9d', '"').
            replace('\\xe2\\x80\\x9e', '"').
            replace('\\xe2\\x80\\x9f', '"').
            replace('\\xe2\\x80\\xa6', '...').  #
            replace('\\xe2\\x80\\xb2', "'").
            replace('\\xe2\\x80\\xb3', "'").
            replace('\\xe2\\x80\\xb4', "'").
            replace('\\xe2\\x80\\xb5', "'").
            replace('\\xe2\\x80\\xb6', "'").
            replace('\\xe2\\x80\\xb7', "'").
            replace('\\xe2\\x81\\xba', "+").
            replace('\\xe2\\x81\\xbb', "-").
            replace('\\xe2\\x81\\xbc', "=").
            replace('\\xe2\\x81\\xbd', "(").
            replace('\\xe2\\x81\\xbe', ")")

            )
    return TEXT
