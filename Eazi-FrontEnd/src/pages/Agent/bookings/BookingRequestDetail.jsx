import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import {
  ArrowLeft,
  Car,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Loader2,
  Tag,
  DollarSign,
  MapPin,
  ArrowRight,
  X
} from "lucide-react";

const BookingRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("pending");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axiosInstance.get(`staff-booking-requests/${id}/`);
        setBooking(res.data);
        setStatus(res.data.status || "pending");
        setNotes(res.data.staff_notes || "");
      } catch (err) {
        console.error("Error fetching booking request:", err);
        setError("Failed to load booking request details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  // Open confirmation modal on form submit
  const handleOpenConfirm = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  // Perform API patch call after user confirms
  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    try {
      await axiosInstance.patch(`staff-booking-requests/${id}/`, {
        status,
        staff_notes: notes,
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error updating request:", err);
      setErrorMessage(
        err.response?.data?.detail || "Failed to update the booking request. Please check your connection and try again."
      );
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white border border-rose-200 rounded-2xl text-center space-y-4 shadow-sm">
        <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Request Not Found</h3>
        <p className="text-sm text-slate-500">{error || "The requested booking does not exist."}</p>
        <button
          onClick={() => navigate("/booking-requests")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition"
        >
          <ArrowLeft size={14} /> Back to Requests
        </button>
      </div>
    );
  }

  const { customer, vehicle } = booking;

  // Helper to resolve location string or object format safely
  const formatLocation = (location) => {
    if (!location) return "Not specified";
    if (typeof location === "object") return location.name || location.address || JSON.stringify(location);
    return location;
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 bg-slate-50/50 min-h-screen relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/booking-requests")}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition shadow-xs"
            title="Back to Booking Requests"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review Booking Request</h1>
              <span className="text-xs font-mono font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                #{id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Manage customer request approval and internal notes</p>
          </div>
        </div>

        <CurrentBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle & Pricing Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="relative h-56 bg-slate-100">
              {vehicle?.main_image ? (
                <img
                  src={vehicle.main_image}
                  alt={`${vehicle?.make} ${vehicle?.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Car size={40} />
                  <span className="text-xs mt-2">No image available</span>
                </div>
              )}
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Tag size={12} />
                {vehicle?.registration_number || "NO REG"}
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {vehicle?.make} {vehicle?.model}
                  </h2>
                  <p className="text-xs text-slate-500">Vehicle Category Details</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-900">${vehicle?.price_per_day}</span>
                  <span className="text-xs text-slate-500"> / day</span>
                </div>
              </div>

              {/* Deposit Banner */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                <span className="text-slate-500">Security Deposit Required</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <DollarSign size={13} className="text-slate-500" />
                  {vehicle?.deposit ?? "0.00"}
                </span>
              </div>

              {/* Rental Dates Summary */}
              <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-xl flex items-center justify-between text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" />
                  <span>Start: <strong>{booking.start_date}</strong></span>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" />
                  <span>End: <strong>{booking.end_date}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup & Dropoff Route Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" /> Logistics & Route Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup Location */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin size={13} className="text-emerald-600" /> Pickup Location
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock size={11} /> {booking.pickup_time || "N/A"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {formatLocation(booking.pickup_location)}
                </p>
              </div>

              {/* Dropoff Location */}
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin size={13} className="text-rose-600" /> Dropoff Location
                  </span>
                  <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock size={11} /> {booking.dropoff_time || "N/A"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {formatLocation(booking.dropoff_location)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-slate-500" /> Customer Information
            </h3>

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-12 w-12 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-base">
                {customer?.first_name?.[0] || "U"}
                {customer?.last_name?.[0] || ""}
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-900 text-base">
                  {customer?.first_name} {customer?.last_name}
                </h4>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <a href={`mailto:${customer?.email}`} className="flex items-center gap-1.5 hover:text-blue-600 transition">
                    <Mail size={13} className="text-slate-400" />
                    {customer?.email || "No email"}
                  </a>
                  <a href={`tel:${customer?.phone_number}`} className="flex items-center gap-1.5 hover:text-blue-600 transition">
                    <Phone size={13} className="text-slate-400" />
                    {customer?.phone_number || "No phone"}
                  </a>
                </div>
              </div>
            </div>

            {/* Customer Message */}
            {booking.message && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <MessageSquare size={13} /> Customer Note:
                </span>
                <p className="text-xs text-slate-600 bg-amber-50/50 border border-amber-200/60 p-3.5 rounded-xl italic">
                  "{booking.message}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Decision Panel */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleOpenConfirm}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 sticky top-6"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Decision & Action</h3>
              <p className="text-xs text-slate-500">Update request status and attach internal notes</p>
            </div>

            {/* Status Segmented Control */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Set Booking Status</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("pending")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                    status === "pending"
                      ? "bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <AlertCircle size={16} className="mb-1 text-amber-600" />
                  Pending
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("accepted")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                    status === "accepted"
                      ? "bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CheckCircle2 size={16} className="mb-1 text-emerald-600" />
                  Accept
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("declined")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                    status === "declined"
                      ? "bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <XCircle size={16} className="mb-1 text-rose-600" />
                  Decline
                </button>
              </div>
            </div>

            {/* Staff Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Internal Staff Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-slate-400 resize-none"
                placeholder="Write internal staff comments, deposit payment reference, or refusal reasons..."
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3 rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Decision
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/booking-requests")}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-2 transition font-medium"
              >
                Cancel & Return
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Confirm Decision</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Are you sure you want to update request <strong className="text-slate-800">#{id}</strong> with the following details?
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">New Status:</span>
                  <span className="capitalize font-bold text-slate-900 px-2 py-0.5 bg-white rounded border border-slate-200">
                    {status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-1">Staff Notes:</span>
                  <p className="text-slate-700 italic bg-white p-2 rounded border border-slate-200 max-h-24 overflow-y-auto">
                    {notes.trim() ? notes : "No notes provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SUCCESS ACKNOWLEDGEMENT MODAL --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-100">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Request Updated</h3>
              <p className="text-xs text-slate-500 mt-1">
                Booking request <strong>#{id}</strong> has been updated to <strong className="capitalize">{status}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/booking-requests");
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              Return to Requests
            </button>
          </div>
        </div>
      )}

      {/* --- FAILURE ACKNOWLEDGEMENT MODAL --- */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-100">
            <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Update Failed</h3>
              <p className="text-xs text-slate-500 mt-1">{errorMessage}</p>
            </div>

            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              Close & Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper Badge Component ---
const CurrentBadge = ({ status }) => {
  const configs = {
    accepted: {
      label: "Accepted",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
    declined: {
      label: "Declined",
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      icon: XCircle,
    },
    pending: {
      label: "Pending Review",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
    },
  };

  const config = configs[status] || configs.pending;
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
      <IconComponent size={14} />
      {config.label}
    </span>
  );
};

// --- Loading Skeleton ---
const DetailSkeleton = () => (
  <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
    <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-72 bg-white border border-slate-200 rounded-2xl"></div>
        <div className="h-40 bg-white border border-slate-200 rounded-2xl"></div>
      </div>
      <div className="h-80 bg-white border border-slate-200 rounded-2xl"></div>
    </div>
  </div>
);

export default BookingRequestDetail;