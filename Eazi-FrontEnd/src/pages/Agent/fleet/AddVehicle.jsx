import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../../../api/axiosInstance";
import MultiSelectDropdown from "../../../components/MultipleDropdown";



const AddVehicle = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    manufacture_year: "",
    color: "",
    mileage: "",
    mileage_allowance: "",
    ownership: "",
    price_per_day: "",
    deposit: "",
    registration_number: "",
    next_service_date: "",
    image_uploads: [],
  });

  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Reset input field after upload
  const [pickupLocations, setPickupLocations] = useState([]);
  useEffect(() => {
    axiosInstance.get("agent-locations/").then((res) => {
      setPickupLocations(res.data);  // List of locations agent can assign
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData((prevData) => ({
      ...prevData,
      image_uploads: [...prevData.image_uploads, ...imageFiles],
    }));

    setFileInputKey(Date.now()); // Reset input field
  };

  const removeImage = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      image_uploads: prevData.image_uploads.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    for (const key in formData) {
      if (key === "image_uploads") {
        formData.image_uploads.forEach(({ file }) => {
          formDataToSend.append("image_uploads", file);
        });
      } else if (key === "pickup_locations") {
        formData.pickup_locations?.forEach((locId) => {
          formDataToSend.append("pickup_locations", locId);
        });
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      await axiosInstance.post(`/staff-vehicles/`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      alert("Vehicle added successfully!");
      navigate("/vehicles");
    } catch (error) {
      console.error("Error adding vehicle:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 mt-16 md:mt-0">
      <div className="bg-white p-6 shadow-md w-full">
        <h2 className="text-2xl font-semibold mb-4 text-center">Add New Vehicle</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Responsive Grid Layout for Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:px-5">

            {[
              { name: "make", label: "Make" },
              { name: "model", label: "Model" },
              { name: "color", label: "Color" },
              { name: "mileage", label: "Mileage", type: "number" },
              { name: "mileage_allowance", label: "Mileage Allowance", type: "number" },
              { name: "price_per_day", label: "Price Per Day", type: "number" },
              { name: "deposit", label: "Deposit", type: "number" },
              { name: "registration_number", label: "Registration Number" },
            ].map(({ name, label, type = "text" }) => (
              <div key={name}>
                <label htmlFor={name} className="block text-gray-700 font-medium">{label}</label>
                <input
                  type={type}
                  id={name}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-500 transition"
                />
              </div>
            ))}

            {/* Manufacture Year */}
            <div>
              <label htmlFor="manufacture_year" className="block text-gray-700 font-medium">Manufacture Year</label>
              <input
                type="number"
                id="manufacture_year"
                name="manufacture_year"
                value={formData.manufacture_year}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-500 transition"
              />
            </div>

            {/* Next Service Date */}
            <div>
              <label htmlFor="next_service_date" className="block text-gray-700 font-medium">Next Service Date</label>
              <input
                type="date"
                id="next_service_date"
                name="next_service_date"
                value={formData.next_service_date}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-500 transition"
              />
            </div>

            {/* Ownership Dropdown */}
            <div>
              <label htmlFor="ownership" className="block text-gray-700 font-medium">Ownership</label>
              <select
                id="ownership"
                name="ownership"
                value={formData.ownership}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-500 transition"
              >
                <option value="">Select Ownership</option>
                <option value="private">Private</option>
                <option value="company">Company</option>
              </select>
            </div>

            <MultiSelectDropdown
              options={pickupLocations}
              selected={formData.pickup_locations || []}
              setSelected={(selectedIds) =>
                setFormData({ ...formData, pickup_locations: selectedIds })
              }
            />


          </div> {/* End of Grid */}

          {/* Image Upload */}
          <div>
            <label htmlFor="image_uploads" className="block text-gray-700 font-medium">Upload Images</label>
            <input
              key={fileInputKey} // Reset input after upload
              type="file"
              id="image_uploads"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-500 transition"
            />
          </div>

          {/* Image Previews Grid */}
          {formData.image_uploads.length > 0 && (
            <div className="mt-4">
              <h3 className="text-gray-700 font-medium">Image Previews</h3>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {formData.image_uploads.map(({ preview, file }, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Uploaded ${index}`}
                      className="w-full h-24 object-cover rounded border border-gray-300"
                    />
                    <p className="text-xs text-center text-gray-600 mt-1 truncate">{file.name}</p>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-full opacity-75 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button type="button" onClick={() => navigate("/fleet/vehicles")} className="px-4 py-2 bg-gray-500 text-white rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
              Add Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
