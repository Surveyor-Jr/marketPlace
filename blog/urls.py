from django.urls import path
from .views import PostList, PostDetail

urlpatterns = [
    path('', PostList.as_view(), name='blog_list'),
    path('<int:pk>/', PostDetail.as_view(), name='blog_detail'),
]