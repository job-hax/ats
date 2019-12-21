from .models import Major


def insert_or_update_major(name):
    majors = Major.objects.filter(name__iexact=name)
    if majors.count() == 0:
        major = Major.objects.create(name=name)
        major.save()
    return Major.objects.get(name__iexact=name)
