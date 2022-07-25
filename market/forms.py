from django.forms import fields, forms, ModelForm, widgets
from django import forms
from .models import Advert


class AdvertForm(ModelForm):
    item_name = forms.CharField(required=False, label='', widget=forms.TextInput(attrs={
        'class': 'col-lg-12 col-md-12 col-sm-12 form-class mb-3',
        'placeholder': 'Name',
    }))

    # cover_image = forms.ImageField(widget=forms.ImageField(attrs={
    #     'class': 'col-lg-12 col-md-12 col-sm-12 form-class mb-3',
    # }))

    class Meta:
        model = Advert
        fields = ['item_name', 'item_type', 'item_category', 'cover_image', 'description', 'price', 'location_province', 'location_area', 'image_1',
                  'image_2', 'image_3']

        widgets = {
            'item_type': forms.Select(
                attrs={
                    'class': 'form-group'
                }
            ),
            'item_category': forms.Select(
                attrs={
                    'class': 'form-group'
                }
            ),
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
