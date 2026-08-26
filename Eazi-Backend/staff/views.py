from django.contrib.auth import authenticate, get_user_model, login
from django.db.models import F, Sum
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.authtoken.models import Token as DRFToken
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import action, api_view
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

# Rentals imports
from rentals.models import BookingRequest
from rentals.serializers import FinalizeBookingSerializer as CustomerFinalizeBookingSerializer

# Regulator imports
from regulator.authentication import CookieJWTAuthentication
from regulator.permissions import IsAgent, IsCustomer
from regulator.serializers import CustomerSerializer
from regulator.utility.utils import get_user_agency

# Local app imports
from .models import Booking, Location, MaintenanceRecord, Vehicle, VehicleImage, VehicleUnavailability
from .serializers import (
    BookingSerializer,
    LocationSerializer,
    MaintenanceRecordSerializer,
    VehicleImageSerializer,
    VehicleSerializer,
    VehicleUnavailabilitySerializer,
)


class AgentLocationListView(generics.ListAPIView):
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated, IsAgent]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'agent_profile'):
            return Location.objects.filter(agency=user.agent_profile.agency)
        return Location.objects.none()


class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAgent]

    def get_queryset(self):
        agency = get_user_agency(self.request.user)
        return Vehicle.objects.filter(agency=agency)

    def update(self, request, *args, **kwargs):
        vehicle = self.get_object()
        serializer = self.get_serializer(vehicle, data=request.data, partial=True)

        if serializer.is_valid():
            vehicle = serializer.save()

            deleted_images = request.data.get("deleted_images")
            if deleted_images:
                try:
                    image_ids = eval(deleted_images)
                    VehicleImage.objects.filter(id__in=image_ids).delete()
                except Exception:
                    pass

            if "images" in request.FILES:
                for img in request.FILES.getlist("images"):
                    VehicleImage.objects.create(vehicle=vehicle, image=img)

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        agency = get_user_agency(self.request.user)
        if not agency:
            raise PermissionDenied("No associated agency found.")
        serializer.save(agency=agency)


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.all()
    serializer_class = MaintenanceRecordSerializer


class VehicleUnavailabilityListCreateView(generics.ListCreateAPIView):
    queryset = VehicleUnavailability.objects.all()
    serializer_class = VehicleUnavailabilitySerializer


class VehicleCreateView(generics.CreateAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer


class VehicleImageViewSet(viewsets.ModelViewSet):
    queryset = VehicleImage.objects.all()
    serializer_class = VehicleImageSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Image deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    @action(detail=False, methods=['get'], url_path='customer/(?P<customer_id>\\d+)')
    def customer_bookings(self, request, customer_id=None):
        """Returns all bookings for a specific customer."""
        bookings = self.queryset.filter(customer_id=customer_id)
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)


class FinalizeBookingView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request, booking_request_id):
        booking_request = get_object_or_404(BookingRequest, id=booking_request_id)

        if Booking.objects.filter(booking_request=booking_request).exists():
            return Response({"error": "Booking already exists for this request."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CustomerFinalizeBookingSerializer(
            data=request.data,
            context={
                'request': request,
                'booking_request_id': booking_request.id
            }
        )

        if serializer.is_valid():
            booking = serializer.save()
            return Response(
                {"message": "Booking confirmed successfully!", "booking_id": booking.id},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)