import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../src/api/axiosInstance';
import { 
  BadgeCheck, 
  Clock, 
  XCircle, 
  CarFront, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  MessageSquareText 
} from 'lucide-react';

const statusConfig = {
  pending: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    label: "Pending Review"
  },
  accepted: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: BadgeCheck,
    label: "Accepted"
  },
  declined: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
    label: "Declined"
  },
};

const CustomerBookingRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/booking-requests/')
      .then(res => setRequests(res.data))
      .catch(err => console.error('Error fetching booking requests:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirmClick = (requestId) => {
    navigate(`/customer/booking-requests/${requestId}/confirm`);
  };

  if (loading) {
    return (
      <div className="min-h-[350px] flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Your Booking Requests</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Track and manage your vehicle rental status</p>
        </div>
        <span className="self-start sm:self-center text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
          {requests.length} {requests.length === 1 ? 'Request' : 'Requests'}
        </span>
      </div>

      {/* Empty State */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <CarFront className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">No Booking Requests Found</h3>
            <p className="text-sm text-gray-500 mt-1">When you request a vehicle rental, track its status right here.</p>
          </div>
        </div>
      ) : (
        /* Requests Grid */
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {requests.map(req => {
            const status = statusConfig[req.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <div 
                key={req.id} 
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Top Bar: Status Badge & Request Date */}
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${status.bg}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      Requested {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={req.vehicle.main_image}
                      alt={`${req.vehicle.make} ${req.vehicle.model}`}
                      className="w-full sm:w-32 h-44 sm:h-28 object-cover rounded-xl border border-gray-100 shrink-0"
                    />

                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-snug">
                          {req.vehicle.make} {req.vehicle.model}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Security Deposit: <span className="font-semibold text-gray-800">${req.vehicle.deposit}</span>
                        </p>
                      </div>

                      {/* Rental Dates Chip */}
                      <div className="inline-flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 w-full sm:w-auto">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="font-medium">{req.start_date}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="font-medium">{req.end_date}</span>
                      </div>

                      {/* Agent Notes Block */}
                      {req.staff_notes && req.staff_notes.trim() !== '' && (
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            <MessageSquareText className="w-3.5 h-3.5 text-slate-400" />
                            Agent Note
                          </div>
                          <p className="text-xs text-slate-700 italic">
                            "{req.staff_notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Action Button */}
                {req.status === 'accepted' && (
                  <div className="bg-gray-50/80 px-4 py-3 sm:px-5 border-t border-gray-100 flex items-center justify-end">
                    {req.has_booking ? (
                      <button
                        className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition shadow-sm active:scale-[0.98]"
                        onClick={() => navigate(`/customer/booking-requests/${req.id}/confirmation`)}
                      >
                        View Booking Details
                      </button>
                    ) : (
                      <button
                        className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm active:scale-[0.98]"
                        onClick={() => handleConfirmClick(req.id)}
                      >
                        Confirm Booking
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerBookingRequestsPage;