import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { MoreVertical } from "lucide-react";

const statusColor = (reviewed) =>
  reviewed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";

const BookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axiosInstance.get(`staff-booking-requests/`);
        setRequests(res.data);
      } catch (error) {
        console.error("Error fetching booking requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleReview = (id) => {
    navigate(`/booking-requests/${id}`);
  };

  if (loading) return <p className="p-4 text-gray-600">Loading booking requests...</p>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Booking Requests</h1>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-left">Start → End</th>
              <th className="px-6 py-3 text-left">Vehicle</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {requests.map((req) => (
              <tr key={req.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium">
                  {req.customer.first_name} {req.customer.last_name}
                </td>
                <td className="px-6 py-4">{req.customer.phone_number}</td>
                <td className="px-6 py-4">{req.start_date} → {req.end_date}</td>
                <td className="px-6 py-4">{req.vehicle.make} {req.vehicle.model}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(req.is_reviewed)}`}>
                    {req.is_reviewed ? "Reviewed" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 relative">
                  <button
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => setDropdownOpen(dropdownOpen === req.id ? null : req.id)}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {dropdownOpen === req.id && (
                    <div className="absolute right-2 top-2 mb-2 w-32 bg-white border rounded-sm shadow-lg z-10 dropdown">
                      <button
                        onClick={() => handleReview(req.id)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="bg-white p-4 rounded-xl shadow-md space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {req.customer.first_name} {req.customer.last_name}
              </h2>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(req.is_reviewed)}`}>
                {req.is_reviewed ? "Reviewed" : "Pending"}
              </span>
            </div>
            <p className="text-sm"><strong>Phone:</strong> {req.customer.phone_number}</p>
            <p className="text-sm"><strong>Dates:</strong> {req.start_date} → {req.end_date}</p>
            <p className="text-sm"><strong>Vehicle:</strong> {req.vehicle.make} {req.vehicle.model}</p>
            <div className="pt-2 text-right">
              <button
                onClick={() => handleReview(req.id)}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingRequests;
