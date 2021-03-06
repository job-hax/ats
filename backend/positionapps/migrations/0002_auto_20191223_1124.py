# Generated by Django 2.2 on 2019-12-23 19:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('positionapps', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='positionapplication',
            name='candidate_resume',
            field=models.FileField(null=True, upload_to=''),
        ),
        migrations.AddField(
            model_name='positionapplication',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True, verbose_name='email address'),
        ),
        migrations.AddField(
            model_name='positionapplication',
            name='phone_number',
            field=models.CharField(blank=True, max_length=17),
        ),
        migrations.AddField(
            model_name='positionapplication',
            name='reference',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
