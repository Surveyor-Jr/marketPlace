from django.contrib import admin
from .models import Advert


class AdvertAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'item_type', 'price')
    search_fields = ('item_name', 'description')


admin.site.register(Advert, AdvertAdmin)
