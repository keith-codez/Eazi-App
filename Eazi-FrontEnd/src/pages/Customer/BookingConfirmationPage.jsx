import React from 'react';
import { Link, useParams } from 'react-router-dom';

const BookingConfirmationPage = () => {
  const { id } = useParams();

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-xl text-center">
      <h2 className="text-2xl font-semibold text-green-600 mb-4">🎉 Booking Confirmed!</h2>
      <p className="text-gray-700 mb-6">Thank you! Your booking has been successfully submitted.</p>
      <Link
        to={`/customer/bookings/${id}`}
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition"
      >
        View Booking Details
      </Link>
    </div>
  );
};

export default BookingConfirmationPage;
