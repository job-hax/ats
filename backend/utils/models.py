from django.db import models
import datetime

from django.db import models
from django.db.models.manager import Manager
from django.utils.translation import gettext as _


class Agreement(models.Model):
    key = models.CharField(max_length=20)
    is_html = models.BooleanField(default=True)
    value = models.TextField()


class Country(models.Model):
    code2 = models.CharField(max_length=10, blank=True)
    code3 = models.CharField(max_length=10, blank=True)
    name = models.CharField(max_length=200, blank=True)
    capital = models.CharField(max_length=200, blank=True)
    region = models.CharField(max_length=200, blank=True)
    subregion = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name if self.name is not None else ''


class State(models.Model):
    country = models.ForeignKey(
        Country, on_delete=models.CASCADE, null=True, blank=True)
    code = models.CharField(max_length=20, blank=True)
    name = models.CharField(max_length=200, blank=True)
    subdivision = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name if self.name is not None else ''


class PublishedManager(Manager):
    def get_query_set(self):
        return super(PublishedManager, self).get_query_set().filter(is_published=True)


class FeedbackQuestion(models.Model):
    title = models.CharField(max_length=250, verbose_name=_('question'), blank=False, null=False)
    date = models.DateTimeField(verbose_name=_('date'), default=datetime.datetime.now)
    is_published = models.BooleanField(default=True, verbose_name=_('is published'))

    objects = models.Manager()
    published = PublishedManager()

    class Meta:
        ordering = ['-date']
        verbose_name = _('feedback question')
        verbose_name_plural = _('feedback questions')

    def get_answer_count(self):
        return FeedbackAnswer.objects.filter(feedback_question=self).count()

    answer_count = property(fget=get_answer_count)

    def get_cookie_name(self):
        return 'feedback_question_%s' % self.pk

    def __str__(self):
        return u'%s' % (self.title,)


class FeedbackQuestionItem(models.Model):
    feedback_question = models.ForeignKey(FeedbackQuestion, related_name='question', on_delete=models.CASCADE)
    value = models.CharField(max_length=250, verbose_name=_('value'), blank=False, null=False)
    custom_input = models.BooleanField(default=False, verbose_name=_('custom input'))
    pos = models.SmallIntegerField(default='0', verbose_name=_('position'))

    class Meta:
        verbose_name = _('feedback question item')
        verbose_name_plural = _('feedback question items')
        ordering = ['pos']

    def __str__(self):
        return u'%s' % (self.value,)

    def get_answer_count(self):
        return FeedbackAnswer.objects.filter(answer=self).count()

    answer_count = property(fget=get_answer_count)


class FeedbackAnswer(models.Model):
    feedback_question = models.ForeignKey(FeedbackQuestion, on_delete=models.CASCADE, verbose_name=_('feedback question'))
    answer = models.ForeignKey(FeedbackQuestionItem, related_name='answer', on_delete=models.CASCADE, verbose_name=_('answered item'), null=True)
    user_input = models.CharField(max_length=250, verbose_name=_('user input'), null=False, blank=True)
    ip = models.GenericIPAddressField(verbose_name=_('user\'s IP'))
    datetime = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('feedback answer')
        verbose_name_plural = _('feedback answers')
