from django.urls import path
from django.contrib.auth import views as auth_views
from users.forms import LoginForm
from users import views as user_views
from .views import InvoiceDetail, PaymentInfo

urlpatterns = [
    # -> Auth Views
    path('register/', user_views.register, name='register'),
    path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), {'form': LoginForm}, name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('password-reset/', auth_views.PasswordResetView.as_view(
        template_name='users/password_reset.html'), name='password_reset'),
    path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(
        template_name='users/password_reset_done.html'), name='password_reset_done'),
    path('password-reset-confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
        template_name='users/password_reset_confirm.html'), name='password_reset_confirm'),
    path('password-reset-complete/', auth_views.PasswordResetCompleteView.as_view(
        template_name='users/password_reset_complete.html'), name='password_reset_complete'),

    # -> My Account Views
    path('my-account/', user_views.my_account, name='my_account'),


    # -> Configuration Views
    path('profile/', user_views.profile, name='profile'),

    # -> Billing Views
    path('payment-info/', PaymentInfo.as_view(), name='payment_info'),
    path('billing/payment-form/', user_views.make_payment, name='make_payment'),
    path('billing/invoices/<slug:slug>/', InvoiceDetail.as_view(), name='invoice_detail'),

    # -> Settings Views
    path('settings/', user_views.account_settings, name='settings'),
]
