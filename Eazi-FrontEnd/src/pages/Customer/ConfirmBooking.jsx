import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import BookingWizard from '../../components/BookingConfirmationWizard/BookingWizard';
import { ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';

const ConfirmBooking = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/booking-requests/${requestId}/`)
      .then((res) => {
        setRequest(res.data);
        setError(false);
      })
      .catch((err) => {
        console.error("Error fetching booking request details:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [requestId]);

  if (loading) return <ConfirmBookingSkeleton />;

  if (error || !request) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Booking Request Not Found</h3>
            <p className="text-xs text-slate-500">
              We couldn't retrieve the details for this request. It may have been updated or moved.
            </p>
          </div>
          <button
            onClick={() => navigate('/customer/booking-requests')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to My Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/customer/booking-requests')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition shadow-xs cursor-pointer"
              title="Back to Booking Requests"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Confirm Booking
                </h1>
                <span className="text-xs font-mono font-medium bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-100">
                  #{requestId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete your reservation details and review agreement terms
              </p>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-medium self-start sm:self-auto">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Verified Checkout</span>
          </div>
        </div>

        {/* Wizard Wrapper Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <BookingWizard bookingRequest={request} />
        </div>
      </div>
    </div>
  );
};

// --- Loading Skeleton ---
const ConfirmBookingSkeleton = () => (
  <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 animate-pulse">
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
        <div className="h-10 w-10 bg-slate-200 rounded-xl shrink-0"></div>
        <div className="space-y-2 flex-1">
          <div className="h-6 w-48 bg-slate-200 rounded-md"></div>
          <div className="h-3 w-64 bg-slate-200 rounded-md"></div>
        </div>
      </div>
      <div className="h-[480px] bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="h-8 w-1/3 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-xl"></div>
          <div className="space-y-4">
            <div className="h-10 bg-slate-100 rounded-xl"></div>
            <div className="h-10 bg-slate-100 rounded-xl"></div>
            <div className="h-20 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ConfirmBooking;