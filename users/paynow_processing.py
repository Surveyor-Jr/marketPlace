from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import messages
from django.conf import settings
from marketPlace.settings import paynow
from .forms import UserRegisterForm, PaymentForm
import time


def process_valid_form(request, form):
    phone_number = form.cleaned_data.get('phone')
    amount = form.cleaned_data.get('amount')
    email = form.cleaned_data.get('email')
    payment_method = form.cleaned_data.get('payment_method')

    payment = paynow.create_payment('Order #100', email)
    payment.add('GCN Account Subscription', amount)
    # Save response from Paynow
    response = paynow.send_mobile(payment, phone_number, payment_method)

    if response.success:
        # Save this to DB
        poll_url = response.poll_url
        # Payment Status
        # instructions = response.instructions #TODO: What does this really do?

        # Give time for user to pay
        time.sleep(30)

        # Check status of transaction
        status = paynow.check_transaction_status(poll_url)

        if status.paid:
            # Save the data to the DB
            instance = form.save(commit=False)
            instance.user = request.user  # attach user profile
            instance.email = email
            instance.phone = phone_number
            instance.amount = amount
            instance.poll_url = poll_url  # PayNow variable
            instance.payment_status = status.status  # Paynow Variable
            instance.payment_method = payment_method
            instance.save()

            # TODO:-> Consider Sending Email Receipt to the user?
            # Give the user a response
            messages.success(request, f"Payment Status: {status.status}")

        else:
            messages.warning(request, f"The payment transaction failed with payment status: {status.status}. ")

    else:
        messages.warning(request, "An error occurred while trying to process the transactions. Please try again later")
    return redirect('make_payment')
