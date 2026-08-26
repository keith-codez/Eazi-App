import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";

const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Management
  const [vehicle, setVehicle] = useState(null);
  const [initialVehicle, setInitialVehicle] = useState(null);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Image Management
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  // Modal Controls
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: "success", // 'success' | 'error'
    title: "",
    message: "",
  });

  // Fetch Vehicle & Location Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicleRes, locationsRes] = await Promise.all([
          axiosInstance.get(`staff-vehicles/${id}/`),
          axiosInstance.get(`agent-locations/`),
        ]);

        const fetchedData = vehicleRes.data;
        // Normalize locations array to contain IDs
        const normalizedLocations = Array.isArray(fetchedData.locations)
          ? fetchedData.locations.map((loc) => (typeof loc === "object" ? loc.id : loc))
          : [];

        const preparedVehicle = { ...fetchedData, locations: normalizedLocations };

        setVehicle(preparedVehicle);
        setInitialVehicle(preparedVehicle);
        setExistingImages(fetchedData.images || []);
        setAvailableLocations(locationsRes.data || []);
      } catch (err) {
        console.error("Error fetching vehicle data:", err);
        showStatus("error", "Failed to Load", "Could not retrieve vehicle details from the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationToggle = (locationId) => {
    setVehicle((prev) => {
      const currentLocs = prev.locations || [];
      const updatedLocs = currentLocs.includes(locationId)
        ? currentLocs.filter((lId) => lId !== locationId)
        : [...currentLocs, locationId];
      return { ...prev, locations: updatedLocs };
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setDeletedImageIds((prev) => [...prev, imageId]);
  };

  // Helper for triggering feedback modal
  const showStatus = (type, title, message) => {
    setStatusModal({ isOpen: true, type, title, message });
  };

  const closeStatusModal = () => {
    const isSuccess = statusModal.type === "success";
    setStatusModal({ isOpen: false, type: "success", title: "", message: "" });
    if (isSuccess) {
      navigate("/fleet/vehicles");
    }
  };

  // Process API Form Submission
  const executeSubmit = async () => {
    setIsConfirmModalOpen(false);
    setSubmitting(true);

    const formData = new FormData();
    const excludedKeys = ["images", "locations", "agent", "removed_images", "image_uploads"];

    // Append regular attributes
    Object.entries(vehicle).forEach(([key, value]) => {
      if (!excludedKeys.includes(key) && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Append locations array for DRF PrimaryKeyRelatedField
    if (Array.isArray(vehicle.locations)) {
      vehicle.locations.forEach((locId) => {
        formData.append("locations", locId);
      });
    }

    // Append new uploaded files matching serializer field 'image_uploads'
    newImages.forEach((file) => {
      formData.append("image_uploads", file);
    });

    // Append removed image IDs matching serializer field 'removed_images'
    deletedImageIds.forEach((imgId) => {
      formData.append("removed_images", imgId);
    });

    try {
      await axiosInstance.patch(`staff-vehicles/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      showStatus("success", "Vehicle Updated", "Vehicle information has been successfully saved.");
    } catch (err) {
      console.error("Error updating vehicle:", err);
      const errorMsg =
        err.response?.data?.detail ||
        (typeof err.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : "An unexpected error occurred while saving changes.");
      showStatus("error", "Update Failed", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Entire Vehicle Action
  const handleDeleteVehicle = async () => {
    setIsDeleteModalOpen(false);
    setSubmitting(true);

    try {
      await axiosInstance.delete(`staff-vehicles/${id}/`);
      showStatus("success", "Vehicle Deleted", "The vehicle record has been permanently removed.");
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      showStatus("error", "Deletion Failed", "Unable to delete this vehicle record.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading vehicle details...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate("/fleet/vehicles")}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1 transition"
          >
            ← Back to Vehicles
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Edit Vehicle: {initialVehicle?.make} {initialVehicle?.model}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg font-medium text-sm transition self-start sm:self-auto"
        >
          Delete Vehicle
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setIsConfirmModalOpen(true); }} className="space-y-6">
        
        {/* Section 1: Basic Specifications */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-3">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Make</label>
              <input
                type="text"
                name="make"
                value={vehicle.make || ""}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Model</label>
              <input
                type="text"
                name="model"
                value={vehicle.model || ""}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Registration Number</label>
              <input
                type="text"
                name="registration_number"
                value={vehicle.registration_number || ""}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Color</label>
              <input
                type="text"
                name="color"
                value={vehicle.color || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Manufacture Year</label>
              <input
                type="number"
                name="manufacture_year"
                value={vehicle.manufacture_year || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Ownership Status</label>
              <select
                name="ownership"
                value={vehicle.ownership || "company"}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition"
              >
                <option value="company">Company Owned</option>
                <option value="private">Privately Owned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing, Mileage & Dates */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-3">Pricing & Maintenance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Daily Rate ($)</label>
              <input
                type="number"
                name="price_per_day"
                value={vehicle.price_per_day || 0}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Security Deposit ($)</label>
              <input
                type="number"
                name="deposit"
                value={vehicle.deposit || 0}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Current Mileage (km)</label>
              <input
                type="number"
                name="mileage"
                value={vehicle.mileage || 0}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Daily Mileage Allowance (km)</label>
              <input
                type="number"
                name="mileage_allowance"
                value={vehicle.mileage_allowance || 0}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Next Service Date</label>
              <input
                type="date"
                name="next_service_date"
                value={vehicle.next_service_date || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Branch Location Checklist */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-lg font-semibold text-gray-800">Assigned Branch Locations</h2>
            <p className="text-xs text-gray-500 mt-1">Check the active locations where this vehicle is available for rental pickup:</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {availableLocations.map((loc) => {
              const isChecked = (vehicle.locations || []).includes(loc.id);
              return (
                <label
                  key={loc.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition cursor-pointer select-none ${
                    isChecked ? "bg-blue-50 border-blue-300 text-blue-900" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleLocationToggle(loc.id)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <span className="text-sm font-semibold block">{loc.name}</span>
                    {loc.city && <span className="text-xs text-gray-500 block">{loc.city}</span>}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 4: Image Management */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-3">Vehicle Images</h2>

          {/* Existing Images */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Saved Gallery</h3>
            {existingImages.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No existing photos saved.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-video">
                    <img src={img.image} alt="Vehicle" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow hover:bg-red-700 transition"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Image Uploads */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Upload Additional Images</h3>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />

            {newImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {newImages.map((file, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border-2 border-emerald-500 bg-gray-50 aspect-video">
                    <img src={URL.createObjectURL(file)} alt="Staging New" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(idx)}
                      className="absolute top-2 right-2 bg-gray-900/70 text-white p-1 rounded-full shadow hover:bg-gray-900 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/fleet/vehicles")}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 transition shadow-sm"
          >
            {submitting ? "Saving Changes..." : "Review & Update Vehicle"}
          </button>
        </div>
      </form>

      {/* Confirmation Review Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Updates</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to apply these updates to <span className="font-semibold text-gray-800">{vehicle.make} {vehicle.model}</span>?
            </p>

            <div className="bg-gray-50 p-4 rounded-lg text-xs space-y-1 max-h-48 overflow-y-auto mb-6 border border-gray-200">
              <p className="font-semibold text-gray-700 mb-2">Staged Changes Summary:</p>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">New Photos Added:</span>
                <span className="font-medium text-emerald-600">{newImages.length} photo(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Photos Marked for Removal:</span>
                <span className="font-medium text-red-600">{deletedImageIds.length} photo(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Assigned Branch Locations:</span>
                <span className="font-medium text-gray-800">{vehicle.locations?.length || 0} location(s)</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={executeSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-red-600 mb-2">Delete Vehicle Record</h3>
            <p className="text-sm text-gray-600 mb-6">
              This action permanently deletes this vehicle record and cannot be undone. Are you sure?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVehicle}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback / Status Modal (Success & Error Alerts) */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            {statusModal.type === "success" ? (
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900 mb-2">{statusModal.title}</h3>
            <p className="text-sm text-gray-600 mb-6">{statusModal.message}</p>
            <button
              type="button"
              onClick={closeStatusModal}
              className={`w-full py-2.5 rounded-lg text-white font-medium text-sm transition ${
                statusModal.type === "success" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditVehicle;