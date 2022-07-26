# Generated by Django 4.0.6 on 2022-07-20 22:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('market', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='advert',
            name='item_category',
            field=models.CharField(choices=[('property', 'Property'), ('home_appliances', 'Home Appliances'), ('electronics', 'Electronics'), ('health_and_beauty', 'Health & Beauty'), ('automotive', 'Automotive'), ('furniture', 'Furniture'), ('real_estate', 'Real Estate'), ('jobs', 'Jobs'), ('restaurant', 'Restaurant'), ('consumables', 'Consumables'), ('consultancy', 'Consultancy'), ('other', 'Other')], default=5, max_length=20),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='advert',
            name='advert_reference',
            field=models.TextField(default='b40tsme6jaeiwq23vmkq'),
        ),
    ]
