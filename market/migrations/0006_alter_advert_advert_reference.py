# Generated by Django 4.0.6 on 2022-09-18 11:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('market', '0005_itemcategory_itemtype_province_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='advert',
            name='advert_reference',
            field=models.TextField(default='plt9yd7jts1xcefuu4om'),
        ),
    ]
