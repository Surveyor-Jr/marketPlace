from django.contrib import admin
from django.contrib.auth.admin import UserAdmin, User

from .models import Billing, Profile


@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):
    list_display = ('user', 'email', 'phone', 'expire_date')
    search_fields = ('user', 'email', 'phone')
    list_filter = ('payment_method',)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    pass


# TODO: Find a way to export user data
# class UserAdmin(ImportExportModelAdmin):
#     pass