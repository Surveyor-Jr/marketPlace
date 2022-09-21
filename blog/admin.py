from django.contrib import admin
from .models import Post


class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'summary', 'author', 'date_posted')
    list_filter = ('author',)
    search_fields = ('title', 'summary')


admin.site.register(Post, PostAdmin)
