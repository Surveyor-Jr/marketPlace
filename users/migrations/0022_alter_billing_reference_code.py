# Generated by Django 4.0.6 on 2022-09-18 11:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0021_alter_billing_reference_code'),
    ]

    operations = [
        migrations.AlterField(
            model_name='billing',
            name='reference_code',
            field=models.TextField(default='0wwsekimixr75hznwfsp'),
        ),
    ]
