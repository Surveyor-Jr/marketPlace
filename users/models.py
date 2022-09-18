import random
import string
from datetime import timedelta, date
from django.template.defaultfilters import default, slugify
from django.contrib.auth.models import User
from django.db import models
from django.urls import reverse

PROVINCE = (
    ('harare', 'Harare'), ('bulawayo', 'Bulawayo'), ('midlands', 'Midlands'), ('manicaland', 'Manicaland'),
    ('masvingo', 'Masvingo'), ('mash_east', 'Mashonaland East'), ('mash_west', 'Mashonaland West'),
    ('mash_central', 'Mashonaland Central'), ('mat_north', 'Matabeleland North'), ('mat_south', 'Matabeleland South'),
)

PAYMENT_METHOD = (
    ('ecocash', 'Ecocash'), ('onemoney', 'OneMoney'),
)

SUBSCRIPTION_PLAN = (
    ('800', 'Starter ($1.00)'),
    ('4000', 'Premium ($5.00)'),
)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_pic = models.ImageField(default='default/default_profile_image.png', upload_to='profile_pics')
    org_name = models.CharField(max_length=100, verbose_name='Organization Name', null=True, blank=True)
    contact_number = models.CharField(max_length=10, null=True, blank=True, help_text='in the format: 07xxx')
    address = models.CharField(max_length=200, null=True, blank=True)
    province = models.CharField(max_length=20, choices=PROVINCE, null=True, blank=True)

    def __str__(self):
        return str(self.user)

    class Meta:
        verbose_name_plural = 'User Profiles'


class Coupon(models.Model):
    coupon_code = models.CharField(max_length=10, primary_key=True)
    description = models.TextField()
    discount_percentage = models.FloatField()

    def __str__(self):
        return self.coupon_code

    class Meta:
        verbose_name_plural = 'Coupons'


class Billing(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    email = models.EmailField()
    phone = models.CharField(max_length=10, help_text='Mobile Number - (e.g. 0776887606')
    paid_on = models.DateTimeField(auto_now_add=True)
    # TODO: subscription_plan_type -> user selects between 1. basic 2. premium and 3. platinum
    amount = models.CharField(max_length=50, choices=SUBSCRIPTION_PLAN, verbose_name='Subscription Plan',
                              help_text='For pricing refer to the pricing models <a href="#">here</a>')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD)
    expire_date = models.DateField(default=date.today() + timedelta(days=30))
    reference_code = models.TextField(default=''.join(random.choices(string.ascii_lowercase + string.digits, k=20)))
    # PayNow Variables
    poll_url = models.TextField(null=True)
    payment_status = models.TextField(null=True)
    slug = models.SlugField(null=True)

    def __str__(self):
        return str(self.user)

    class Meta:
        verbose_name_plural = 'Bill Payments'

    # ->TODO: Run this only if user is logged in

    def save(self, *args, **kwargs):
        self.slug = slugify(self.reference_code) # -> For Accessing Paid Invoices
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('invoice_detail', kwargs={"slug": self.slug})
