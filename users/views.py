from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Sum
from django.http import request
from django.views.generic import ListView, DetailView, TemplateView
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from .forms import UserRegisterForm, PaymentForm, UserUpdateForm, ProfileUpdateForm, validate_email
from .models import Billing
from .paynow_processing import process_valid_form



@login_required
def my_account(request):
    return render(request, 'users/my_account.html')


class Dashboard(LoginRequiredMixin, TemplateView):
    template_name = 'users/dashboard.html'

    def get_context_data(self, *args, **kwargs):
        # Retrieve the last payment detail ->
        context = super().get_context_data(*args, **kwargs)
        context['last_payment'] = Billing.objects.filter(user=self.request.user).last()  # -> Retrieves last entry by user
        context['first_payment'] = Billing.objects.filter(
            user=self.request.user).first()  # -> Retrieves first entry by user
        context['total_paid'] = Billing.objects.filter(user=self.request.user).aggregate(Sum('amount'))['amount__sum']
        context['historic_data'] = Billing.objects.filter(user=self.request.user).all()
        return context


# user registration
def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            # Send the user an email
            # to get the domain of the current site
            current_site = get_current_site(request)
            mail_subject = 'Welcome to My-Surveyor'
            message = render_to_string('users/account_creation_welcome_email.html', {
                'user': username,
                'domain': current_site.domain,
                'email': form.cleaned_data.get('email'),
            })
            to_email = form.cleaned_data.get('email')
            email = EmailMessage(
                mail_subject, message, to=[to_email]
            )
            email.send()
            messages.success(request, f'Account for {username} has been created. Login now')
            return redirect('login')

    else:
        form = UserRegisterForm()
    return render(request, 'users/register.html', {'form': form})


@login_required
def profile(request):
    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)
        if u_form.is_valid() and p_form.is_valid():
            u_form.save()
            p_form.save()
            messages.success(request, f'Your User & Profile Information has been updated successfully')
            return redirect('profile')
    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = ProfileUpdateForm(instance=request.user.profile)
    context = {
            'u_form': u_form,
            'p_form': p_form
        }
    return render(request, 'users/profile.html', context)


class PaymentInfo(LoginRequiredMixin, TemplateView):
    template_name = 'users/payment_info.html'

    def get_context_data(self, *args, **kwargs):
        # Retrieve the last payment detail ->
        context = super().get_context_data(*args, **kwargs)
        context['status'] = Billing.objects.filter(user=self.request.user).last()  # -> Retrieves last entry by user
        context['payment_records'] = Billing.objects.all()
        return context


@login_required
def make_payment(request):
    if request.method == 'POST':
        form = PaymentForm(request.POST)
        if form.is_valid():
            process_valid_form(request, form)

    else:
        form = PaymentForm()
    return render(request, 'users/make_payment.html', context={'form': form})


# class InvoiceList(LoginRequiredMixin, ListView):
#     model = Billing
#     template_name = 'users/invoice_list.html'
# #     context_object_name = 'invoice'
#
#     def get_queryset(self):
#         user = get_object_or_404(User, username=self.request.user)
#         return Billing.objects.filter(user=user).order_by('-paid_on')
#
#     def get_context_data(self, *args, **kwargs):
#         # Retrieve the last payment detail ->
#         context = super().get_context_data(*args, **kwargs)
#         context['status'] = Billing.objects.filter(user=self.request.user).last()  # -> Retrieves last entry by user
#         return context


class InvoiceDetail(LoginRequiredMixin, UserPassesTestMixin, DetailView):
    model = Billing
    template_name = 'users/invoice_detail.html'

    def test_func(self):
        invoice = self.get_object()
        if self.request.user == invoice.user:
            return True
        return False


def account_settings(request):
    return render(request, 'users/settings.html')
