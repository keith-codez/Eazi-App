from rest_framework import serializers

from regulator.models import Customer
from regulator.serializers import CustomerMiniSerializer
from .models import (
    Booking,
    Location,
    MaintenanceRecord,
    Vehicle,
    VehicleImage,
    VehicleUnavailability,
)


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'city', 'address']


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRecord
        fields = '__all__'


class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ['id', 'image']
        extra_kwargs = {
            'image': {'use_url': True}
        }


# Alias for backward compatibility if imported by legacy modules
PublicVehicleImageSerializer = VehicleImageSerializer


class VehicleMiniSerializer(serializers.ModelSerializer):
    """Compact vehicle summary for list views and nested serialization."""
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'registration_number', 'price_per_day', 'deposit', 'main_image']

    def get_main_image(self, obj):
        image = obj.images.first()
        if image and image.image:
            request = self.context.get("request")
            return request.build_absolute_uri(image.image.url) if request else image.image.url
        return None


class VehicleSerializer(serializers.ModelSerializer):
    agent = serializers.PrimaryKeyRelatedField(read_only=True)
    images = VehicleImageSerializer(many=True, read_only=True)
    image_uploads = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    removed_images = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    locations = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Location.objects.all(),
        required=False
    )

    class Meta:
        model = Vehicle
        fields = [
            "id", "agent", "make", "model", "manufacture_year", "color",
            "mileage", "mileage_allowance", "ownership", "price_per_day",
            "deposit", "maintenance_records", "registration_number",
            "next_service_date", "images", "image_uploads", "removed_images", "locations"
        ]

    def create(self, validated_data):
        images_data = validated_data.pop("image_uploads", [])
        locations = validated_data.pop("locations", [])

        vehicle = Vehicle.objects.create(**validated_data)
        if locations:
            vehicle.locations.set(locations)

        for image_data in images_data:
            VehicleImage.objects.create(vehicle=vehicle, image=image_data)

        return vehicle

    def update(self, instance, validated_data):
        images_data = validated_data.pop("image_uploads", [])
        removed_images = validated_data.pop("removed_images", [])
        locations = validated_data.pop("locations", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if locations is not None:
            instance.locations.set(locations)

        for image_data in images_data:
            VehicleImage.objects.create(vehicle=instance, image=image_data)

        if removed_images:
            VehicleImage.objects.filter(id__in=removed_images, vehicle=instance).delete()

        return instance


class VehicleUnavailabilitySerializer(serializers.ModelSerializer):
    reason = serializers.CharField(max_length=255, required=False)
    class Meta:
        model = VehicleUnavailability
        fields = '__all__'

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        vehicle = data.get('vehicle')

        if start_date >= end_date:
            raise serializers.ValidationError({"end_date": "End date must be after start date."})

        # Check overlap against system bookings & existing manual blocks
        if not vehicle.is_available(start_date, end_date):
            raise serializers.ValidationError(
                "This vehicle is already booked or blocked during the selected dates."
            )

        return data

    
class BookingSerializer(serializers.ModelSerializer):
    customer = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all())
    vehicle = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all())

    customer_details = CustomerMiniSerializer(source='customer', read_only=True)
    vehicle_details = VehicleMiniSerializer(source='vehicle', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'


class StaffBookingReviewSerializer(serializers.ModelSerializer):
    """Serializer used by staff agents to review, update, and finalize existing bookings."""
    class Meta:
        model = Booking
        fields = ['id', 'booking_status', 'notes']
        extra_kwargs = {
            'booking_status': {'required': False},
            'notes': {'required': False},
        }

    def validate_booking_status(self, value):
        allowed_statuses = ['confirmed', 'canceled', 'completed', 'active']
        if value not in allowed_statuses:
            raise serializers.ValidationError(
                f"Invalid status transition. Allowed choices: {', '.join(allowed_statuses)}"
            )
        return value