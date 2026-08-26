from rest_framework import serializers
from rest_framework.exceptions import NotAuthenticated
from .models import BookingRequest
from staff.models import Vehicle, Location, Booking
from staff.serializers import LocationSerializer, VehicleImageSerializer, VehicleMiniSerializer
from regulator.serializers import CustomerSerializer


class BookingRequestSerializer(serializers.ModelSerializer):
    vehicle = VehicleMiniSerializer(read_only=True)
    vehicle_id = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all(), write_only=True)
    
    # READ representations (returns full location details)
    pickup_location = LocationSerializer(read_only=True)
    dropoff_location = LocationSerializer(read_only=True)
    
    # WRITE representations (accepts location IDs on POST/PUT)
    pickup_location_id = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), write_only=True)
    dropoff_location_id = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), write_only=True)
    
    customer = CustomerSerializer(source='user.customer_profile', read_only=True)
    has_booking = serializers.SerializerMethodField()

    class Meta:
        model = BookingRequest
        fields = [
            'id', 'created_at', 'vehicle', 'vehicle_id', 
            'pickup_location', 'pickup_location_id',
            'dropoff_location', 'dropoff_location_id', 
            'start_date', 'end_date', 'pickup_time',
            'dropoff_time', 'message', 'is_reviewed', 'status', 'staff_notes',
            'customer', 'has_booking',
        ]

    def validate(self, data):
        vehicle = data.get('vehicle_id')
        pickup_location = data.get('pickup_location_id')
        dropoff_location = data.get('dropoff_location_id')

        if vehicle and pickup_location:
            assigned_pickup_locations = vehicle.locations.all()
            if pickup_location not in assigned_pickup_locations:
                raise serializers.ValidationError({
                    "pickup_location_id": "Selected pickup location is not available for this vehicle."
                })

        if vehicle and dropoff_location:
            if vehicle.agency and dropoff_location.agency != vehicle.agency:
                raise serializers.ValidationError({
                    "dropoff_location_id": "Selected dropoff location does not belong to this vehicle's agency."
                })

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

        return BookingRequest.objects.create(
            user=user,
            customer=customer,
            vehicle=vehicle,
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
            **validated_data
        )

    def get_has_booking(self, obj):
        return Booking.objects.filter(booking_request=obj).exists()


class PublicVehicleSerializer(serializers.ModelSerializer):
    pickup_locations = LocationSerializer(source='locations', many=True, read_only=True)
    dropoff_locations = serializers.SerializerMethodField()
    images = VehicleImageSerializer(many=True, read_only=True)
    agency_name = serializers.SerializerMethodField()
    agency_logo = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = '__all__'

    def get_dropoff_locations(self, obj):
        if obj.agency:
            agency_locations = Location.objects.filter(agency=obj.agency)
            return LocationSerializer(agency_locations, many=True).data
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


class FinalizeBookingSerializer(serializers.Serializer):
    national_id = serializers.CharField()
    street_address = serializers.CharField()
    address_line2 = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField()
    country = serializers.CharField()

    next_of_kin1_first_name = serializers.CharField()
    next_of_kin1_last_name = serializers.CharField()
    next_of_kin1_id_number = serializers.CharField()
    next_of_kin1_phone = serializers.CharField()

    pay_now = serializers.BooleanField()

    def save(self, **kwargs):
        user = self.context['request'].user
        customer = user.customer_profile
        booking_request = BookingRequest.objects.get(
            id=self.context['booking_request_id'],
            user=user,
            status='accepted'
        )

        customer.national_id = self.validated_data['national_id']
        customer.street_address = self.validated_data['street_address']
        customer.address_line2 = self.validated_data.get('address_line2', '')
        customer.city = self.validated_data['city']
        customer.country = self.validated_data['country']

        customer.next_of_kin1_first_name = self.validated_data['next_of_kin1_first_name']
        customer.next_of_kin1_last_name = self.validated_data['next_of_kin1_last_name']
        customer.next_of_kin1_id_number = self.validated_data['next_of_kin1_id_number']
        customer.next_of_kin1_phone = self.validated_data['next_of_kin1_phone']
        customer.save()

        vehicle = booking_request.vehicle
        agency = getattr(vehicle, 'agency', None)
        rental_days = (booking_request.end_date - booking_request.start_date).days + 1
        base_amount = vehicle.price_per_day * rental_days
        discount = 100 if self.validated_data['pay_now'] else 0

        booking = Booking.objects.create(
            customer=customer,
            vehicle=vehicle,
            start_date=booking_request.start_date,
            end_date=booking_request.end_date,
            pickup_time=booking_request.pickup_time,
            dropoff_time=booking_request.dropoff_time,
            pickup_location=booking_request.pickup_location.name if booking_request.pickup_location else "",
            dropoff_location=booking_request.dropoff_location.name if booking_request.dropoff_location else "",
            booking_amount=base_amount,
            booking_deposit=vehicle.deposit,
            estimated_mileage=0,
            discount_amount=discount,
            discount_description="Paid full online" if self.validated_data['pay_now'] else "Pay at counter",
            payment_method="mobile transfer" if self.validated_data['pay_now'] else "cash",
            total_amount=base_amount - discount,
            booking_request=booking_request,
            booking_status='pending',
            agency=agency
        )

        booking_request.is_confirmed_by_customer = True
        booking_request.customer_docs_submitted = True
        booking_request.dummy_payment_done = True
        booking_request.save()
        return booking


class StaffBookingRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingRequest
        fields = ['status', 'staff_notes']