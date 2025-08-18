import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import BookingWizard from '../../components/BookingConfirmationWizard/BookingWizard';

const ConfirmBooking = () => {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/booking-requests/${requestId}/`)
      .then((res) => setRequest(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [requestId]);

  if (loading) return <div className="p-6 text-gray-600">Loading booking details...</div>;
  if (!request) return <div className="p-6 text-red-600">Booking not found.</div>;

  return <BookingWizard bookingRequest={request} />;
};

export default ConfirmBooking;
