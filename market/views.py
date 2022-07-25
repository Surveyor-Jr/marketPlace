from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView, ListView, DetailView, CreateView
from .models import Advert
from .forms import AdvertForm


class LandingPage(TemplateView):
    template_name = 'market/home_page.html'

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context['latest_listing'] = Advert.objects.all().order_by('-uploaded_on')[:6]
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
        context['related_ad'] = Advert.objects.filter(item_category=self)
        return context


class NewAd(LoginRequiredMixin, CreateView):
    template_name = 'market/new_ad.html'
    form_class = AdvertForm
    # TODO: success_message =

    def form_valid(self, form):
        form.instance.owner = self.request.user
        return super().form_valid(form)

