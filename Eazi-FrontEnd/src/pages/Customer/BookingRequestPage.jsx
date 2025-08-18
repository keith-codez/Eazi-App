import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";  // Use useNavigate
import axios from "axios";
import CustomerNavbar from "../../components/PublicSidebar";

const BookingRequestPage = () => {
  const { vehicleId } = useParams();  // Get vehicleId from URL
  const navigate = useNavigate();     // Use useNavigate

  // Define state for form fields
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    start_date: "",
    end_date: "",
    vehicle_id: vehicleId,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Submit the booking request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Send POST request to the API
      const response = await axios.post("http://127.0.0.1:8000/api/rentals/booking-requests/", formData);
      alert("Booking request submitted successfully!");
      navigate("/");  // Use navigate to redirect to the home page after successful submission
    } catch (err) {
      setError("There was an error submitting your request.");
      console.error("Error submitting booking request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-6 mt-10 md:mt-0">
      <h2 className="text-2xl font-semibold mb-4">Booking Request</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            className="border border-gray-300 px-4 py-2 rounded-lg w-full"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            className="border border-gray-300 px-4 py-2 rounded-lg w-full"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Name"
            className="border border-gray-300 px-4 py-2 rounded-lg w-full"
            value={formData.phone_number}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border border-gray-300 px-4 py-2 rounded-lg w-full"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

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
            label="Start Date"
            type="date"
            name="end_date"
            className="border border-gray-300 px-4 py-2 rounded-lg w-full"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <textarea
            name="message"
            placeholder="Message (Optional)"
            className="border border-gray-300 px-4 py-2 rounded-lg w-full"
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg w-full hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default BookingRequestPage;