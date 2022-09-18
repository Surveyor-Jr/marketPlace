from django.contrib import admin
from .models import Advert, ItemCategory, ItemType, Province


class TypeAdmin(admin.ModelAdmin):
    pass


class CategoryAdmin(admin.ModelAdmin):
    pass


class AdvertAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'item_category', 'item_type', 'price', 'owner')
    search_fields = ('item_name', 'description')


class ProvinceAdmin(admin.ModelAdmin):
    pass


admin.site.register(Advert, AdvertAdmin)
admin.site.register(ItemType, TypeAdmin)
admin.site.register(ItemCategory, CategoryAdmin)
admin.site.register(Province, ProvinceAdmin)
