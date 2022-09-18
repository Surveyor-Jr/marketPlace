from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView, ListView, DetailView, CreateView
from .models import Advert, ItemType, ItemCategory, Province
from users.models import Billing, Profile
from .forms import AdvertForm


class LandingPage(TemplateView):
    template_name = 'market/home_page.html'

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context['latest_listing'] = Advert.objects.all().order_by('-uploaded_on')[:6]
        context['map_ads'] = Advert.objects.all()
        context['province'] = Province.objects.all()
        context['category'] = ItemCategory.objects.all()
        context['featured_premium_profile'] = Profile.objects.all()  # TODO -> Find ways to automate this
        return context


class AdList(ListView):
    model = Advert
    template_name = 'market/ad_list_view.html'
    context_object_name = 'ad_item'


class AdDetail(DetailView):
    model = Advert
    template_name = 'market/ad_detail_view.html'

    # Related Ads
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context['category'] = ItemCategory.objects.all()
        context['type'] = ItemType.objects.all()
        context['province'] = Province.objects.all()
        # context['related_ad'] = Advert.objects.filter(item_category=self) -> Produces Error
        return context


class NewAd(LoginRequiredMixin, CreateView):
    template_name = 'market/new_ad.html'
    form_class = AdvertForm
    # TODO: success_message =

    def form_valid(self, form):
        form.instance.owner = self.request.user
        return super().form_valid(form)

    # Get Values
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context['type'] = ItemType.objects.all()
        return context


# information views
class TermsAndConditions(TemplateView):
    template_name = 'info-pages/terms-and-conditions.html'


class PrivacyPolicy(TemplateView):
    template_name = 'info-pages/privacy-policy.html'


class AboutUs(TemplateView):
    template_name = 'info-pages/about-us.html'


class FAQ(TemplateView):
    template_name = 'info-pages/faq.html'


class ContactUs(TemplateView):
    template_name = 'info-pages/contact-us.html'
