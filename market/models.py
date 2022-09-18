import string
from django.contrib.auth.models import User
from django.template.defaultfilters import default, slugify
from django.urls import reverse
from django.db import models
import random
from PIL import Image
from geopy.geocoders import Nominatim


class ItemType(models.Model):
    name = models.CharField(max_length=20)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Type'


class ItemCategory(models.Model):
    name = models.CharField(max_length=30)
    # TODO -> to add icon field

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'


class Province(models.Model):
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Province'


class Advert(models.Model):
    # For SEO
    item_name = models.CharField(max_length=100)
    cover_image = models.ImageField(default='placeholder_item_image.png', upload_to='advert_cover_images',
                                    help_text='Recommended image size (300x300)px. Larger sizes will be reduced')
    item_type = models.ForeignKey(ItemType, on_delete=models.CASCADE)
    item_category = models.ForeignKey(ItemCategory, on_delete=models.CASCADE)
    description = models.TextField()
    price = models.FloatField()
    # For Maps
    location_province = models.ForeignKey(Province, on_delete=models.CASCADE, null=True)
    location_area = models.CharField(max_length=100, null=True, verbose_name='Address')
    location_city = models.CharField(max_length=100, null=True, verbose_name='City')
    # -> coordinates
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
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
        # -> Slugifying the URL
        self.slug = slugify(self.item_name)  # -> accessing each ad
        # -> Shrinking an image
        super().save()

        img = Image.open(self.cover_image.path)

        if img.height > 300 or img.width > 300:
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.cover_image.path)

        # -> Geocode an address
        try:
            geolocator = Nominatim(user_agent="marketplace")
            location = geolocator.geocode(
                self.location_area + " " + self.location_city + " " + self.location_province.name)
            self.lat = location.latitude
            self.lon = location.longitude
        # but in-case it fails
        except:
            self.lat = '-19.000'
            self.lon = '29.000'

        # Save Everything Finally
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('ad_detail', kwargs={'pk': self.pk})
