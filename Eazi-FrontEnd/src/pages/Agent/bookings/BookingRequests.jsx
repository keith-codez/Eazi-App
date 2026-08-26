import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { 
  MoreVertical, 
  Calendar, 
  Car, 
  Phone, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  Inbox,
  Eye
} from "lucide-react";

const BookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axiosInstance.get(`staff-booking-requests/`);
        setRequests(res.data || []);
      } catch (error) {
        console.error("Error fetching booking requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReview = (id) => {
    navigate(`/booking-requests/${id}`);
  };

  // Metrics summary
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => !r.is_reviewed).length;
  const reviewedRequests = requests.filter((r) => r.is_reviewed).length;

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Booking Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, review, and confirm incoming customer vehicle rental requests.
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2 text-center">
            <span className="block text-xs text-slate-500 font-medium">Total</span>
            <span className="text-lg font-bold text-slate-800">{totalRequests}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200/80 shadow-sm rounded-lg px-4 py-2 text-center">
            <span className="block text-xs text-amber-700 font-medium">Pending</span>
            <span className="text-lg font-bold text-amber-800">{pendingRequests}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200/80 shadow-sm rounded-lg px-4 py-2 text-center">
            <span className="block text-xs text-emerald-700 font-medium">Reviewed</span>
            <span className="text-lg font-bold text-emerald-800">{reviewedRequests}</span>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Rental Dates</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200 shrink-0">
                          {req.customer?.first_name?.[0] || "U"}
                          {req.customer?.last_name?.[0] || ""}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {req.customer?.first_name} {req.customer?.last_name}
                          </p>
                          <p className="text-xs text-slate-400">ID: #{req.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Phone size={14} className="text-slate-400" />
                        {req.customer?.phone_number || "N/A"}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4 text-slate-700">
                      <div className="flex items-center gap-2 text-xs font-medium bg-slate-100/70 py-1.5 px-3 rounded-lg w-fit text-slate-700">
                        <Calendar size={14} className="text-slate-400 shrink-0" />
                        <span>{req.start_date}</span>
                        <ArrowRight size={12} className="text-slate-400 shrink-0" />
                        <span>{req.end_date}</span>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        <Car size={16} className="text-blue-500 shrink-0" />
                        <span>
                          {req.vehicle?.make} {req.vehicle?.model}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge isReviewed={req.is_reviewed} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReview(req.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Eye size={14} />
                          Review
                        </button>

                        <div className="relative" ref={dropdownRef}>
                          <button
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                            onClick={() => setDropdownOpen(dropdownOpen === req.id ? null : req.id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {dropdownOpen === req.id && (
                            <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-left">
                              <button
                                onClick={() => handleReview(req.id)}
                                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                              >
                                View Details
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 relative"
              >
                {/* Header Row */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                      {req.customer?.first_name?.[0] || "U"}
                      {req.customer?.last_name?.[0] || ""}
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900 text-base">
                        {req.customer?.first_name} {req.customer?.last_name}
                      </h2>
                      <p className="text-xs text-slate-400">ID: #{req.id}</p>
                    </div>
                  </div>
                  <StatusBadge isReviewed={req.is_reviewed} />
                </div>

                {/* Details Grid */}
                <div className="bg-slate-50/70 p-3.5 rounded-xl space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Car size={14} className="text-blue-500" /> Vehicle:
                    </span>
                    <span className="font-medium text-slate-800">
                      {req.vehicle?.make} {req.vehicle?.model}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Phone size={14} /> Phone:
                    </span>
                    <span className="font-medium text-slate-800">{req.customer?.phone_number || "N/A"}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar size={14} /> Dates:
                    </span>
                    <span className="font-medium text-slate-800">
                      {req.start_date} → {req.end_date}
                    </span>
                  </div>
                </div>

                {/* Mobile Action */}
                <button
                  onClick={() => handleReview(req.id)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow-sm"
                >
                  Review Request
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- Helper Components ---

const StatusBadge = ({ isReviewed }) => {
  if (isReviewed) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        <CheckCircle2 size={12} />
        Reviewed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
      <Clock size={12} />
      Pending
    </span>
  );
};

const LoadingSkeleton = () => (
  <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
    <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
    <div className="h-64 bg-white border border-slate-200 rounded-2xl p-6"></div>
  </div>
);

const EmptyState = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
    <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
      <Inbox size={24} />
    </div>
    <h3 className="text-lg font-bold text-slate-800">No Booking Requests</h3>
    <p className="text-sm text-slate-500">
      There are currently no pending or reviewed booking requests available.
    </p>
  </div>
);

export default BookingRequests;