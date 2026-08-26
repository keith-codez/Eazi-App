from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from regulator.authentication import CookieJWTAuthentication
from regulator.permissions import IsAgent, IsCustomer, IsOwnerOfBookingRequest
from regulator.utility.utils import get_user_agency

from staff.models import Vehicle, VehicleImage
from staff.serializers import VehicleImageSerializer
from .models import BookingRequest
from .serializers import (
    BookingRequestSerializer,
    PublicVehicleSerializer,
    StaffBookingRequestUpdateSerializer,
)


class BookingRequestViewSet(viewsets.ModelViewSet):
    serializer_class = BookingRequestSerializer
    permission_classes = [IsAuthenticated, IsCustomer, IsOwnerOfBookingRequest]

    def get_queryset(self):
        user = self.request.user
        return (
            BookingRequest.objects.select_related('user', 'vehicle')
            .filter(user=user)
            .order_by('-created_at')
        )


class PublicVehicleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = PublicVehicleSerializer
    permission_classes = [AllowAny]
    authentication_classes = []


class PublicVehicleImageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VehicleImage.objects.all()
    serializer_class = VehicleImageSerializer
    permission_classes = [AllowAny]
    authentication_classes = []


class StaffBookingRequestViewSet(viewsets.ModelViewSet):
    serializer_class = BookingRequestSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAgent]

    def get_queryset(self):
        user = self.request.user
        agency = get_user_agency(user)

        if agency:
            return (
                BookingRequest.objects.filter(vehicle__agency=agency)
                .select_related('user', 'vehicle')
                .order_by('-created_at')
            )

        return BookingRequest.objects.none()

    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        new_status = serializer.validated_data.get('status', previous_status)

        kwargs = {}
        if previous_status == 'pending' and new_status in ['accepted', 'declined']:
            kwargs['is_reviewed'] = True
            if hasattr(self.request.user, 'agent_profile'):
                kwargs['agent'] = self.request.user.agent_profile

        serializer.save(**kwargs)

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return StaffBookingRequestUpdateSerializer
        return BookingRequestSerializer