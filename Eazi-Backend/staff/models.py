from django.contrib.auth.models import AbstractUser,  Group, Permission
from django.db import models
from django.dispatch import receiver
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.core.exceptions import ValidationError
from django.utils.html import strip_tags
import os
from django.conf import settings
from rest_framework.authtoken.models import Token
from regulator.models import Customer, Agent, Agency
from django.db.models import Q



class Location(models.Model):
    agency = models.ForeignKey(Agency, on_delete=models.CASCADE, related_name='locations')
    name = models.CharField(max_length=100, unique=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100)
    coordinates = models.CharField(max_length=100, blank=True)  # For maps (optional)

    def __str__(self):
        return self.name


class Vehicle(models.Model):
    OWNERSHIP_CHOICES = [
        ("company", "Company Owned"),
        ("private", "Privately Owned"),
    ]
    agency = models.ForeignKey(Agency, on_delete=models.CASCADE, related_name='vehicles')
    locations = models.ManyToManyField(Location, related_name='vehicles', blank=True)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    manufacture_year = models.PositiveIntegerField()
    color = models.CharField(max_length=50)
    mileage = models.PositiveIntegerField()
    mileage_allowance = models.PositiveIntegerField(default=0)
    ownership = models.CharField(max_length=10, choices=OWNERSHIP_CHOICES)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    maintenance_records = models.TextField(blank=True, null=True)
    registration_number = models.CharField(max_length=20, unique=True)
    next_service_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.make} {self.model} {self.color} ({self.registration_number})"

    def is_available(self, start_date, end_date):
        """
        Checks if the vehicle is free between start_date and end_date
        against both system Bookings and manual VehicleUnavailability blocks.
        """
        # 1. Check for overlapping system bookings (confirmed, active, or pending)
        has_booking_conflict = self.bookings.filter(
            booking_status__in=["confirmed", "active", "pending"],
            start_date__lt=end_date,
            end_date__gt=start_date
        ).exists()

        if has_booking_conflict:
            return False

        # 2. Check for overlapping manual unavailability blocks
        has_manual_block = self.unavailable_periods.filter(
            start_date__lt=end_date,
            end_date__gt=start_date
        ).exists()

        return not has_manual_block

    def get_occupied_ranges(self):
        """
        Returns a single unified list of all blocked date ranges
        combining system bookings and manual blocks.
        """
        occupied = []

        # System bookings
        active_bookings = self.bookings.filter(
            booking_status__in=["confirmed", "active", "pending"]
        )
        for b in active_bookings:
            occupied.append({
                "id": f"booking-{b.id}",
                "start_date": str(b.start_date),
                "end_date": str(b.end_date),
                "type": "system_booking",
                "title": f"Booked: {b.customer.first_name} {b.customer.last_name}",
            })

        # Manual blocks (Airbnb, maintenance, etc.)
        manual_blocks = self.unavailable_periods.all()
        for u in manual_blocks:
            reason_label = u.reason.capitalize() if u.reason else "Unavailable"
            occupied.append({
                "id": f"block-{u.id}",
                "start_date": str(u.start_date),
                "end_date": str(u.end_date),
                "type": "manual_block",
                "title": f"Blocked ({reason_label})",
            })

        return occupied


class VehicleImage(models.Model):
    vehicle = models.ForeignKey(Vehicle, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="vehicle_images/")

    def __str__(self):
        return f"Image for {self.vehicle.make} {self.vehicle.model}"


class MaintenanceRecord(models.Model):
    
    vehicle = models.ForeignKey(Vehicle, related_name="maintenance_entries", on_delete=models.CASCADE)  # Fix conflict
    date = models.DateField()
    description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Maintenance for {self.vehicle.brand} {self.vehicle.model} on {self.date}"



# staff/models.py

class VehicleUnavailability(models.Model):
    REASON_CHOICES = [
        ("external_booking", "External Booking (e.g. Airbnb/Manual)"),
        ("maintenance", "Maintenance / Service"),
        ("personal", "Personal Use"),
        ("other", "Other"),
    ]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="unavailable_periods")
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=255)
    notes = models.TextField(blank=True, null=True)  # Optional note for context

    def __str__(self):
        return f"{self.vehicle.make} {self.vehicle.model} manual block ({self.reason}) from {self.start_date} to {self.end_date}"




class Booking(models.Model):
    booking_request = models.OneToOneField('rentals.BookingRequest', on_delete=models.CASCADE, related_name='booking', null=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="bookings")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="bookings")
    created_at = models.DateTimeField(auto_now_add=True)
    start_date = models.DateField()
    end_date = models.DateField()
    booking_amount = models.DecimalField(max_digits=10, decimal_places=2)
    booking_deposit = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=[("mobile transfer", "Mobile Transfer"), ("debit card", "Debit Card"), ("cash", "Cash")], default="cash") 
    booking_status = models.CharField(max_length=20, choices=[("confirmed", "Confirmed"), ("pending", "Pending"), ("completed", "Completed"), ("active", "Active"), ("canceled", "Canceled")], default="pending")
    estimated_mileage = models.PositiveIntegerField(default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_description = models.TextField(blank=True, null=True)
    pickup_location = models.CharField(max_length=255, blank=True, null=True)
    dropoff_location = models.CharField(max_length=255, blank=True, null=True)
    pickup_time = models.TimeField(blank=True, null=True)
    dropoff_time = models.TimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    agency = models.ForeignKey(
        Agency, 
        on_delete=models.PROTECT, 
        related_name="bookings", 
        null=True, 
        blank=True
    )


    def __str__(self):
        return f"Booking for {self.customer} - {self.vehicle} from {self.start_date} to {self.end_date}"
    
    


