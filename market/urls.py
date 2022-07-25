from django.urls import path
from .views import LandingPage, AdList, AdDetail, NewAd

urlpatterns = [
    path('', LandingPage.as_view(), name='landing_page'),
    path('ads/', AdList.as_view(), name='ad_list_view'),
    path('ads/<slug:slug>/<int:pk>/', AdDetail.as_view(), name='ad_detail'),
    path('create-ad/', NewAd.as_view(), name='new_ad'),
]