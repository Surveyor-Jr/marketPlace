# Generated by Django 4.0.6 on 2022-09-21 12:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('market', '0010_alter_advert_advert_reference'),
    ]

    operations = [
        migrations.AlterField(
            model_name='advert',
            name='advert_reference',
            field=models.TextField(default='eowvy2bhanzysegqo5yb'),
        ),
    ]
