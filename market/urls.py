from django.urls import path
from .views import LandingPage, AdList, AdDetail, NewAd, TermsAndConditions, PrivacyPolicy, AboutUs, FAQ, ContactUs


urlpatterns = [
    path('', LandingPage.as_view(), name='landing_page'),
    path('ads/', AdList.as_view(), name='ad_list_view'),
    path('ads/<slug:pk>/', AdDetail.as_view(), name='ad_detail'),
    path('create-ad/', NewAd.as_view(), name='new_ad'),

    # information views
    path('about-us/', AboutUs.as_view(), name='about_us'),
    path('terms-and-conditions/', TermsAndConditions.as_view(), name='terms_and_conditions'),
    path('privacy-policy', PrivacyPolicy.as_view(), name='privacy_policy'),
    path('frequently-asked-questions/', FAQ.as_view(), name='faq'),
    path('contact-us/', ContactUs.as_view(), name='contact_us'),
]