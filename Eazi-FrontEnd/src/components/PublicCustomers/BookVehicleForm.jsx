import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { AuthContext } from "../../contexts/AuthContext";
import TimePicker from "react-time-picker";


const BookVehicleForm = ({ vehicleId }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [pickupLocations, setPickupLocations] = useState([]);


  const [formData, setFormData] = useState({
    vehicle_id: vehicleId,
    start_date: "",
    end_date: "",
    pickup_time: "",
    dropoff_time: "",
    message: "",
    pickup_location_id: "",
    dropoff_location_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
  const fetchPickupLocations = async () => {
    try {
      const res = await axiosInstance.get(`public-vehicles/${vehicleId}/`);
      if (res.data && res.data.pickup_locations) {
        setPickupLocations(res.data.pickup_locations); // should be array of {id, name}
      }
    } catch (error) {
      console.error("Failed to load pickup locations", error);
    }
  };

  fetchPickupLocations();
}, [vehicleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {            
        vehicle_id: vehicleId,       // 👈 Match backend field name
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

      alert("Booking request submitted successfully!");
      navigate("/customer/dashboard");
    } catch (err) {
      setError("Failed to submit booking request.");
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          label="Start Date"
          type="date"
          name="start_date"
          className="border border-gray-300 px-4 py-2 rounded-lg w-full"
          value={formData.start_date}
          onChange={handleChange}
          required
        />
        <input
          label="End Date"
          type="date"
          name="end_date"
          className="border border-gray-300 px-4 py-2 rounded-lg w-full"
          value={formData.end_date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="time"
          name="pickup_time"
          className="border border-gray-300 px-4 py-2 rounded-lg w-full"
          value={formData.pickup_time}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="dropoff_time"
          className="border border-gray-300 px-4 py-2 rounded-lg w-full"
          value={formData.dropoff_time}
          onChange={handleChange}
          required
        />
      </div>

      <select
        name="pickup_location_id"
        value={formData.pickup_location_id}
        onChange={handleChange}
        required
        className="border border-gray-300 px-4 py-2 rounded-lg w-full"
      >
        <option value="">Select Pickup Location</option>
        {pickupLocations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>

      <select
        name="dropoff_location_id"
        value={formData.dropoff_location_id}
        onChange={handleChange}
        required
        className="border border-gray-300 px-4 py-2 rounded-lg w-full"
      >
        <option value="">Select Dropoff Location</option>
        {pickupLocations.map((loc) => (
          <option key={loc.id} value={loc.id}>{loc.name}</option>
        ))}
      </select>

      <textarea
        name="message"
        placeholder="Message (Optional)"
        className="border border-gray-300 px-4 py-2 rounded-lg w-full"
        value={formData.message}
        onChange={handleChange}
      />

      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded-lg w-full hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Booking Request"}
      </button>
    </form>
  );
};

export default BookVehicleForm;
