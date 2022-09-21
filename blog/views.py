from django.shortcuts import render
from django.views.generic import ListView, DetailView

from .models import Post
from market.models import ItemCategory


class PostList(ListView):
    model = Post
    template_name = 'blog/blog_list.html'
    context_object_name = 'blog'

    # categories and other
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context['category'] = ItemCategory.objects.all()
        # -> older posts
        context['older_posts'] = Post.objects.order_by('-date_posted')
        return context


class PostDetail(DetailView):
    model = Post
    template_name = 'blog/blog_detail.html'

    # categories and other
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context['category'] = ItemCategory.objects.all()
        # -> older posts
        context['recent_posts'] = Post.objects.order_by('date_posted')
        return context
