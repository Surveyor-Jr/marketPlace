from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.core.exceptions import ValidationError
from django.forms import ModelForm
from django.contrib import messages

from users.models import Billing, Profile

def validate_email(value):
    if User.objects.filter(email=value).exists():
        raise ValidationError(f"{value} is taken.", params={'value': value})


class LoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-group'}))
    password = forms.PasswordInput(attrs={'class': 'form-group'})


class UserRegisterForm(UserCreationForm):
    first_name = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control',
                                                               }))
    last_name = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control',
                                                              }))
    email = forms.EmailField(validators=[validate_email])

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password1', 'password2')


class UserUpdateForm(forms.ModelForm):
    username = forms.CharField(required=True, widget=forms.TextInput(attrs={
        'class': 'form-control mb-3',
        'id': 'username',
        'readonly': 'readonly',
    }))

    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={
        'class': 'form-control mb-3',
        'id': 'email',
        'readonly': 'readonly',
    }))

    class Meta:
        model = User
        fields = ['username', 'email']


class ProfileUpdateForm(forms.ModelForm):
    # profile_pic = forms.ImageField TODO: Deal with images later
    org_name = forms.CharField(label='Organization Name', widget=forms.TextInput(attrs={
        'class': 'form-control',
        'id': 'org_name',
    }))
    contact_number = forms.CharField(label='Contact Number', widget=forms.TextInput(attrs={
        'class': 'form-control',
        'id': 'contact_number',
    }))
    address = forms.CharField(label='Postal Address', widget=forms.TextInput(attrs={
        'class': 'form-control',
        'id': 'address',
    }))

    class Meta:
        model = Profile
        fields = ['org_name', 'contact_number', 'address', 'province']


class PaymentForm(ModelForm):
    email = forms.EmailField(required=True, label='Email', widget=forms.EmailInput(attrs={
        'class': 'form-control',
        'id': 'email',
    }))
    phone = forms.CharField(required=True, label='Mobile Number', widget=forms.TextInput(attrs={
        'class': 'form-control',
        'id': 'phone',
    }))
    # amount = forms.CharField(required=True, label='Select Subscription Plan', widget=forms.Select(
    #     choices=SUBSCRIPTION_PLAN))

    class Meta:
        model = Billing
        fields = ('email', 'amount', 'phone', 'payment_method')
