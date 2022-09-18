from django.forms import fields, forms, ModelForm, widgets
from django import forms
from .models import Advert


class AdvertForm(forms.ModelForm):
    item_name = forms.CharField(required=False, label='Name of Item', widget=forms.TextInput(attrs={
        'class': 'col-lg-12 col-md-12 col-sm-12 form-class mb-3',
    }))

    class Meta:
        model = Advert
        fields = ['item_name', 'item_type', 'cover_image', 'item_category', 'description', 'price',
                  'location_area', 'location_city', 'location_province', 'image_1', 'image_2', 'image_3']

        widgets = {
            'item_type': forms.RadioSelect(),
            'item_category': forms.RadioSelect(),
            'location_province': forms.RadioSelect(),
            'description': forms.Textarea(
                attrs={
                    'class': 'col-lg-12 col-md-12 col-sm-12 form-group'
                }
            ),
            'price': forms.TextInput(
                attrs={
                    'class': 'form-group mb-3'
                }
            ),
        }
