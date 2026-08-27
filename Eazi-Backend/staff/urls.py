# staff/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VehicleViewSet, 
    MaintenanceRecordViewSet, 
    VehicleImageViewSet, 
    BookingViewSet,
    VehicleUnavailabilityViewSet, # Imported refactored viewset
    AgentLocationListView,       # Ensure this is imported if used
    FinalizeBookingView          # Ensure this is imported if used
)

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'maintenance', MaintenanceRecordViewSet, basename='maintenance')
router.register(r'vehicle-images', VehicleImageViewSet, basename='vehicle-image')
router.register(r'bookings', BookingViewSet, basename='booking')

# --- NEW: REGISTER REFACTORED VIEWSET HERE ---
router.register(r'unavailability', VehicleUnavailabilityViewSet, basename='unavailability')

urlpatterns = [
    # Router handles:
    # /api/staff/unavailability/ (GET, POST)
    # /api/staff/unavailability/{id}/ (GET, PATCH, DELETE)
    path('', include(router.urls)),

    # --- OLD PATH REMOVED: path("vehicle-unavailability/", ...), ---

    # Keeping generic views/APIViews registered outside the router:
    path("agent-locations/", AgentLocationListView.as_view(), name="agent-locations"),
    # If FinalizeBookingView is used within this app's URLs:
    path('booking-request/<int:booking_request_id>/finalize/', FinalizeBookingView.as_view(), name='finalize-booking'),
]