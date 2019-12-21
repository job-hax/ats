from position.models import JobPosition


def get_or_insert_position(title):
    jt, new = JobPosition.objects.all().get_or_create(job_title__iexact=title)
    jt.job_title = title
    jt.save()
    return jt