import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
};

function BookingRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`staff-booking-requests/${id}`)
      .then(res => {
        setBooking(res.data);
        setStatus(res.data.status);
        setNotes(res.data.staff_notes || '');
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching booking request:', err);
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axiosInstance.patch(`staff-booking-requests/${id}/`, {
      status,
      staff_notes: notes,
    })
      .then(() => navigate('/booking-requests'))
      .catch(err => console.error('Error updating request:', err));
  };

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (!booking) return <div className="p-6 text-red-500">Booking request not found.</div>;

  const { customer, vehicle } = booking;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Review Booking Request</h2>

      {/* Vehicle and Customer Card */}
      <div className="bg-white border rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Image */}
        <img
          src={vehicle.main_image}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-48 object-cover rounded-md"
        />

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-700">
          <h3 className="text-lg font-semibold mb-1">Vehicle & Booking Info</h3>
          <p><strong>Make & Model:</strong> {vehicle.make} {vehicle.model}</p>
          <p><strong>Registration:</strong> {vehicle.registration_number}</p>
          <p><strong>Price per day:</strong> ${vehicle.price_per_day}</p>
          <p><strong>Deposit:</strong> ${vehicle.deposit}</p>
          <p><strong>Dates:</strong> {booking.start_date} → {booking.end_date}</p>
          <p><strong>Pickup Time:</strong> {booking.pickup_time}</p>
          <p><strong>Dropoff Time:</strong> {booking.dropoff_time}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${statusColors[booking.status]}`}>
              {booking.status.toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-white border rounded-lg shadow p-4 space-y-1 text-sm text-gray-700">
        <h3 className="text-lg font-semibold mb-2">Customer Info</h3>
        <p><strong>Name:</strong> {customer.first_name} {customer.last_name}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone_number}</p>
        <p><strong>Message:</strong> {booking.message || '—'}</p>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg shadow p-4 space-y-4">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accept</option>
            <option value="declined">Decline</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Staff Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any staff notes here"
          />
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          >
            Save Review
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingRequestDetail;
