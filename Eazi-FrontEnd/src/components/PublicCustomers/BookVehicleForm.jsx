import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const BookVehicleForm = ({ vehicleId }) => {
  const navigate = useNavigate();

  // Location States
  const [pickupLocations, setPickupLocations] = useState([]);
  const [dropoffLocations, setDropoffLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    vehicle_id: vehicleId,
    start_date: "",
    end_date: "",
    pickup_time: "09:00",
    dropoff_time: "09:00",
    message: "",
    pickup_location_id: "",
    dropoff_location_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    isSuccess: false,
    title: "",
    message: "",
  });

  // Fetch Vehicle Pickups & Agency-Wide Locations
  useEffect(() => {
    const fetchLocationsData = async () => {
      setLoadingLocations(true);
      setError(null);
      try {
        const vehicleRes = await axiosInstance.get(`public-vehicles/${vehicleId}/`);
        const vehicleData = vehicleRes.data;

        const vehiclePickups = vehicleData?.pickup_locations || vehicleData?.locations || [];
        setPickupLocations(vehiclePickups);

        if (vehiclePickups.length > 0) {
          setFormData((prev) => ({ ...prev, pickup_location_id: vehiclePickups[0].id }));
        }

        const vehicleDropoffs =
          vehicleData?.dropoff_locations || vehicleData?.agency_locations || vehiclePickups;

        setDropoffLocations(vehicleDropoffs);

        if (vehicleDropoffs.length > 0) {
          setFormData((prev) => ({ ...prev, dropoff_location_id: vehicleDropoffs[0].id }));
        }
      } catch (err) {
        console.error("Failed to load vehicle location data", err);
        setError("Could not load vehicle or location details.");
      } finally {
        setLoadingLocations(false);
      }
    };

    if (vehicleId) {
      fetchLocationsData();
    }
  }, [vehicleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        vehicle_id: vehicleId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        pickup_time: formData.pickup_time,
        dropoff_time: formData.dropoff_time,
        message: formData.message,
        pickup_location_id: formData.pickup_location_id,
        dropoff_location_id: formData.dropoff_location_id,
      };

      await axiosInstance.post("booking-requests/", payload, {
        withCredentials: true,
      });

      // Show Success Modal
      setModal({
        isOpen: true,
        isSuccess: true,
        title: "Booking Request Submitted!",
        message: "Your vehicle booking request has been recorded. Our team will review and contact you shortly.",
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        "Failed to submit booking request. Please verify your selected dates and locations.";

      setError(errorMsg);
      
      // Show Error Modal
      setModal({
        isOpen: true,
        isSuccess: false,
        title: "Booking Submission Failed",
        message: errorMsg,
      });
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (modal.isSuccess) {
      setModal({ ...modal, isOpen: false });
      navigate("/customer/dashboard");
    } else {
      setModal({ ...modal, isOpen: false });
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (loadingLocations) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Loading branch locations...</p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && !modal.isOpen && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>{error}</div>
          </div>
        )}

        {/* SECTION 1: Pick-up & Return Schedule */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Rental Duration & Schedule
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pickup Date & Time Card */}
            <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 space-y-3">
              <span className="text-xs font-semibold text-gray-700 block">Pick-up Details</span>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Pick-up Date</label>
                <input
                  type="date"
                  name="start_date"
                  min={today}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Pick-up Time</label>
                <div className="relative">
                  <input
                    type="time"
                    name="pickup_time"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={formData.pickup_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dropoff Date & Time Card */}
            <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 space-y-3">
              <span className="text-xs font-semibold text-gray-700 block">Return Details</span>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Return Date</label>
                <input
                  type="date"
                  name="end_date"
                  min={formData.start_date || today}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Return Time</label>
                <div className="relative">
                  <input
                    type="time"
                    name="dropoff_time"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={formData.dropoff_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Branch Locations Selection */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Branch Pickup & Drop-off Points
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pickup Location Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Pick-up Branch <span className="text-red-500">*</span>
              </label>
              <select
                name="pickup_location_id"
                value={formData.pickup_location_id}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
              >
                <option value="">-- Select Pick-up Location --</option>
                {pickupLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.city ? `(${loc.city})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Branches where this specific vehicle is currently assigned.
              </p>
            </div>

            {/* Dropoff Location Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Drop-off Branch <span className="text-red-500">*</span>
              </label>
              <select
                name="dropoff_location_id"
                value={formData.dropoff_location_id}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
              >
                <option value="">-- Select Drop-off Location --</option>
                {dropoffLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.city ? `(${loc.city})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Choose any active agency branch for vehicle return.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: Additional Requests */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-semibold text-gray-700">
            Special Notes or Driver Requests <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            name="message"
            rows="3"
            placeholder="Flight details, requested child seat, late arrival notes..."
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm resize-none"
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm disabled:bg-blue-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting Booking Request...</span>
              </>
            ) : (
              "Confirm & Submit Booking Request"
            )}
          </button>
        </div>
      </form>

      {/* STATUS MODAL (SUCCESS / ERROR) */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-xl border border-gray-100 transform transition-all">
            {/* Modal Status Icon */}
            <div
              className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${
                modal.isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
              }`}
            >
              {modal.isSuccess ? (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            {/* Modal Title & Text */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-gray-900">{modal.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{modal.message}</p>
            </div>

            {/* Modal Action Button */}
            <div className="pt-2">
              <button
                onClick={closeModal}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition shadow-sm ${
                  modal.isSuccess
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-gray-800 hover:bg-gray-900 text-white"
                }`}
              >
                {modal.isSuccess ? "Go to My Dashboard" : "Close & Try Again"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookVehicleForm;