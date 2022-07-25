import string
from django.contrib.auth.models import User
from django.template.defaultfilters import default, slugify
from django.urls import reverse
from django.db import models
import random

ITEM_TYPE = (
    ('good', 'Goods'),
    ('service', 'Services')
)

ITEM_CATEGORY = (
    ('property', 'Property'),
    ('home_appliances', 'Home Appliances'),
    ('electronics', 'Electronics'),
    ('health_and_beauty', 'Health & Beauty'),
    ('automotive', 'Automotive'),
    ('furniture', 'Furniture'),
    ('real_estate', 'Real Estate'),
    ('jobs', 'Jobs'),
    ('food_nutrition', 'Food & Nutrition'),
    ('consultancy', 'Professional & Consultancy'),
    ('other', 'Other'),
)

ITEM_PROVINCE = (
    ('harare', 'Harare'),
    ('bulawayo', 'Bulawayo'),
    ('manicaland', 'Manicaland'),
    ('midlands', 'Midlands'),
    ('masvingo', 'Masvingo'),
    ('mash_east', 'Mash-East'),
    ('mash_central', 'Mash Central'),
    ('mash_west', 'Mash West'),
    ('mat_south', 'Mat South'),
    ('mat_north', 'Mat-North'),
)


class Advert(models.Model):
    # For SEO
    item_name = models.CharField(max_length=100)
    cover_image = models.ImageField(default='placeholder_item_image.png', upload_to='advert_cover_images')
    item_type = models.CharField(max_length=10, choices=ITEM_TYPE)
    item_category = models.CharField(max_length=20, choices=ITEM_CATEGORY)
    description = models.TextField()
    price = models.FloatField()
    # For Maps
    location_province = models.CharField(max_length=30, null=True, choices=ITEM_PROVINCE)
    location_area = models.CharField(max_length=100, null=True)
    # For visual
    image_1 = models.ImageField(null=True, blank=True, upload_to='advert_image_one')
    image_2 = models.ImageField(null=True, blank=True, upload_to='advert_image_two')
    image_3 = models.ImageField(null=True, blank=True, upload_to='advert_image_three')
    advert_reference = models.TextField(default=''.join(random.choices(string.ascii_lowercase + string.digits, k=20)))
    slug = models.SlugField(editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_on = models.DateTimeField(auto_now_add=True)
    last_edited = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.item_name

    class Meta:
        verbose_name_plural = 'Client Adverts'

    def save(self, *args, **kwargs):
        self.slug = slugify(self.advert_reference)  # -> accessing each ad
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('ad_detail', kwargs={'slug': self.slug,
                                            'pk': self.pk})


