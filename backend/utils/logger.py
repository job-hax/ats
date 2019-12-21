import datetime


def log(log, type):
    with open("inapp_error.log", "a") as text_file:
        print(str(datetime.datetime.now()) + ' / ' + str(type) + ' ' + str(log), file=text_file)
