from rest_framework import serializers
from rest_framework.exceptions import NotAuthenticated
from .models import BookingRequest
from staff.models import Vehicle, VehicleImage, Location, Booking
from staff.serializers import LocationSerializer


class VehicleMiniSerializer(serializers.ModelSerializer):
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


class BookingRequestSerializer(serializers.ModelSerializer):
    vehicle = VehicleMiniSerializer(read_only=True)
    vehicle_id = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all(), write_only=True)
    pickup_location_id = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), write_only=True)
    dropoff_location_id = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), write_only=True)
    customer = serializers.SerializerMethodField()
    has_booking = serializers.SerializerMethodField()

    class Meta:
        model = BookingRequest
        fields = [
            'id',
            'created_at',
            'vehicle',
            'vehicle_id',
            'pickup_location_id',
            'dropoff_location_id',
            'start_date',
            'end_date',
            'pickup_time',
            'dropoff_time',
            'message',
            'is_reviewed',
            'status',
            'staff_notes',
            'customer',
            'has_booking',
        ]

    def _get_vehicle_agency_locations(self, vehicle):
        """Helper to safely fetch agency locations whether vehicle links to agency or agent."""
        if hasattr(vehicle, 'agency') and vehicle.agency:
            return vehicle.agency.locations.all()
        elif hasattr(vehicle, 'agent') and vehicle.agent and hasattr(vehicle.agent, 'agency'):
            return vehicle.agent.agency.locations.all()
        return Location.objects.none()

    def validate(self, data):
        vehicle = data.get('vehicle_id')
        pickup_location = data.get('pickup_location_id')
        dropoff_location = data.get('dropoff_location_id')

        allowed_locations = self._get_vehicle_agency_locations(vehicle)

        if pickup_location not in allowed_locations:
            raise serializers.ValidationError({"pickup_location_id": "Selected pickup location is not available for this vehicle."})

        if dropoff_location not in allowed_locations:
            raise serializers.ValidationError({"dropoff_location_id": "Selected dropoff location is not available for this vehicle."})

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        
        if not request or not request.user or not request.user.is_authenticated:
            raise NotAuthenticated("You must be logged in as a customer to submit a booking request.")

        user = request.user
        customer = getattr(user, 'customer_profile', None)

        if not customer:
            raise serializers.ValidationError("Booking requests must come from a registered customer.")

        vehicle = validated_data.pop('vehicle_id')
        pickup_location = validated_data.pop('pickup_location_id')
        dropoff_location = validated_data.pop('dropoff_location_id')
        agent = getattr(vehicle, 'agent', None)

        return BookingRequest.objects.create(
            user=user,
            customer=customer,
            vehicle=vehicle,
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
            agent=agent,
            **validated_data
        )

    def get_customer(self, obj):
        customer = getattr(obj.user, 'customer_profile', None)
        if not customer:
            return None

        return {
            "first_name": customer.first_name,
            "last_name": customer.last_name,
            "email": customer.email,
            "phone_number": customer.phone_number,
            "national_id": customer.national_id,
            "street_address": customer.street_address,
            "address_line2": customer.address_line2,
            "city": customer.city,
            "country": customer.country,
            "next_of_kin1_first_name": customer.next_of_kin1_first_name,
            "next_of_kin1_last_name": customer.next_of_kin1_last_name,
            "next_of_kin1_id_number": customer.next_of_kin1_id_number,
            "next_of_kin1_phone": customer.next_of_kin1_phone,
            "drivers_license": customer.drivers_license.url if customer.drivers_license else None,
        }

    def get_has_booking(self, obj):
        return Booking.objects.filter(booking_request=obj).exists()


class PublicVehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ["id", "image"]
        extra_kwargs = {
            "image": {"use_url": True}
        }


class PublicVehicleSerializer(serializers.ModelSerializer):
    pickup_locations = serializers.SerializerMethodField()
    images = PublicVehicleImageSerializer(many=True, read_only=True)
    agency_name = serializers.SerializerMethodField()
    agency_logo = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = '__all__'

    def get_pickup_locations(self, obj):
        if obj.agency:
            locations = obj.agency.locations.all()
            return LocationSerializer(locations, many=True).data
        return []

    def get_agency_name(self, obj):
        return obj.agency.name if obj.agency else None

    def get_agency_logo(self, obj):
        try:
            request = self.context.get("request")
            if obj.agency and obj.agency.logo and request:
                return request.build_absolute_uri(obj.agency.logo.url)
        except Exception:
            pass
        return None


class StaffBookingRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingRequest
        fields = ['status', 'staff_notes']