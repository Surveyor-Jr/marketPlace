# Generated by Django 4.0.6 on 2022-09-18 14:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0023_alter_billing_reference_code'),
    ]

    operations = [
        migrations.AlterField(
            model_name='billing',
            name='reference_code',
            field=models.TextField(default='bn9oizsd30voff441gae'),
        ),
    ]
