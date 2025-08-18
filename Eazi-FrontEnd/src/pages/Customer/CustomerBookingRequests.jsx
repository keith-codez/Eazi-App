import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../src/api/axiosInstance';
import { BadgeCheck, Clock, XCircle, CarFront } from 'lucide-react'; // Optional icons

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
};

const CustomerBookingRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/booking-requests/')
      .then(res => setRequests(res.data))
      .catch(err => console.error('Error fetching booking requests:', err));
  }, []);

  const handleConfirmClick = (requestId) => {
    navigate(`/customer/booking-requests/${requestId}/confirm`);
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Booking Requests</h2>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {requests.map(req => (
          <div key={req.id} className="bg-white shadow-lg rounded-xl p-4 flex flex-col space-y-4 transition hover:shadow-xl">
            <div className="flex items-center space-x-4">
              <img
                src={req.vehicle.main_image}
                alt={`${req.vehicle.make} ${req.vehicle.model}`}
                className="w-32 h-24 object-cover rounded-lg border"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {req.vehicle.make} {req.vehicle.model}
                </h3>
                <p className="text-sm text-gray-500">
                  Submitted: {new Date(req.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Rental: {req.start_date} → {req.end_date}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[req.status]}`}>
                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
              </span>
              <span className="text-sm text-gray-600">
                Deposit: <strong>${req.vehicle.deposit}</strong>
              </span>
            </div>

            {req.status === 'accepted' && (
              <div className="pt-2 text-right">
                {req.has_booking ? (
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm rounded-md transition"
                    onClick={() => navigate(`/customer/booking-requests/${req.id}/confirmation`)}
                  >
                    View Booking Details
                  </button>
                ) : (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-md transition"
                    onClick={() => handleConfirmClick(req.id)}
                  >
                    Confirm Booking
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerBookingRequestsPage;
