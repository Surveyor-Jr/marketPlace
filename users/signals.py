import random
import string
from datetime import datetime, timedelta, date

from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
# from django.core.mail import EmailMessage
from django.core.mail import EmailMultiAlternatives

from .models import Profile, Billing


# Signal To Create a User-Profile on Account Creation
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


# Signal to Create a 7-Day Trial on Account Creation
@receiver(post_save, sender=User)
def create_free_trial(sender, instance, created, **kwargs):
    if created:
        Billing.objects.create(user=instance, email=instance, phone='0718870810',
                               paid_on=datetime.now(),
                               amount=0,
                               payment_method='ecocash',
                               expire_date=date.today() + timedelta(days=3),  # -> Assign 3 Day Free Trial
                               reference_code='free_trial'.join(random.choices(string.ascii_lowercase + string.digits,
                                                                               k=5))
                               # Assign a 5-digit code at the end
                               )


@receiver(post_save, sender=User)
def save_free_trial(sender, instance, **kwargs):
    instance.profile.save()


# Signal to send an email when user registers
@receiver(post_save, sender=User)
def send_email_to_user(sender, instance, **kwargs):
    user_email = User.objects.filter(email=instance)
    subject, from_email, to = 'Welcome to My-Surveyor', 'kumbirai@kms.co.zw', user_email
    text_content = 'Welcome to the digital geospatial platform in Zimbabwe'
    html_content = '<p>Welcome to <strong>My-Surveyor</strong platform. Congratulations on creating an account with ' \
                   'us today. We are confident that you will like it here. Feel free to explore and reach out to us ' \
                   'in case you need some training.  We offer all users a free demo. Send us an email today on <a ' \
                   'href="mailto:kumbirai@kms.co.zw">kumbirai@kms.co.zw</a></p><p>Warm regards</p> '
    msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
    msg.attach_alternative(html_content, "text/html")
    msg.send()
