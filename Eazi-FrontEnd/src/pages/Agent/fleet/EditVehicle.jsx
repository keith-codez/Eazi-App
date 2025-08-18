import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";


const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]); // Track deleted images
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialVehicle, setInitialVehicle] = useState(null); // Store original data
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  


  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await axiosInstance.get(`staff-vehicles/${id}/`);
        setVehicle(response.data);
        setInitialVehicle(response.data); // Store initial data for comparison
        setExistingImages(response.data.images || []);
      } catch (err) {
        console.error("Error fetching vehicle:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  const getChangedFields = () => {
    if (!initialVehicle) return [];
  
    return Object.keys(vehicle).filter(
      (key) => vehicle[key] !== initialVehicle[key] // Check what changed
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prevImages) => [...prevImages, ...files]);
  };

  const handleDeleteImage = (imageId) => {
    setExistingImages(existingImages.filter((img) => img.id !== imageId)); // Remove from UI
    setDeletedImages((prevDeleted) => [...prevDeleted, imageId]); // Track the deleted image ID
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();

  // Append updated vehicle data
  Object.entries(vehicle).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  // Ensure next_service_date is included
  if (vehicle.next_service_date) {
    formData.append("next_service_date", vehicle.next_service_date);
  }

  // Add new images
  newImages.forEach((file) => {
    formData.append("images", file);
  });

  // Add deleted images to remove them from backend
  formData.append("deleted_images", JSON.stringify(deletedImages));

  try {
    await axiosInstance.patch(`staff-vehicles/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    navigate("/vehicles");
  } catch (err) {
    console.error("Error updating vehicle:", err);
  }
};

  if (loading) return <p className="text-center text-gray-500">Loading vehicle details...</p>;

  const handleConfirmSubmit = async () => {
    setIsModalOpen(false); // Close modal
    await handleSubmit(new Event("submit")); // Manually trigger form submission
  };

  const handleDeleteVehicle = async () => {
    try {
      await axiosInstance.delete(`staff-vehicles/${id}/`);
      setIsDeleteModalOpen(false); // Close modal
      navigate("/vehicles"); // Redirect to vehicle list after deletion
    } catch (err) {
      console.error("Error deleting vehicle:", err);
    }
  };
  
  return (
    <div className={`${isModalOpen ? "overflow-hidden h-screen" : ""}`}>
    <div className="w-full max-w-4xl mx-auto p-6 mt-16 md:mt-0 ">
      <h2 className="text-2xl font-semibold mb-4">Edit Vehicle</h2>
      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative z-50">
            <h3 className="text-lg font-semibold mb-4">Confirm Changes</h3>
            <p className="text-gray-700">Review the details before updating:</p>

            {/* Summary of vehicle details */}
            <div className="mt-4 bg-gray-100 p-3 rounded-md text-sm">
              <ul className="space-y-1">
                {Object.entries(vehicle).map(([key, value]) => (
                  <li key={key}>
                    <strong className="capitalize">{key.replace(/_/g, " ")}:</strong>{" "}
                    {key === "images" ? (
                      <div className="flex flex-wrap gap-2">
                        {/* Existing Images (filtered to exclude deleted ones) */}
                        {Array.isArray(value) &&
                          value
                            .filter((img) => !deletedImages.includes(img.id)) // Exclude deleted images
                            .map((img) => (
                              <img
                                key={img.id}
                                src={img.image}
                                alt="Vehicle"
                                className="w-16 h-16 inline-block rounded-md"
                              />
                            ))}

                        {/* Newly Added Images */}
                        {newImages.map((file, index) => (
                          <img
                            key={`new-${index}`}
                            src={URL.createObjectURL(file)}
                            alt="New"
                            className="w-16 h-16 inline-block rounded-md border-2 border-green-500"
                          />
                        ))}
                      </div>
                    ) : Array.isArray(value) ? (
                      value.join(", ") // For other arrays
                    ) : typeof value === "object" && value !== null ? (
                      JSON.stringify(value)
                    ) : (
                      value
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative z-50">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Confirm Delete</h3>
            <p className="text-gray-700">Are you sure you want to delete this vehicle? This action cannot be undone.</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVehicle}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium">Make</label>
          <input type="text" name="make" value={vehicle.make} onChange={handleInputChange} className="w-full border p-2 rounded focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">Model</label>
          <input type="text" name="model" value={vehicle.model} onChange={handleInputChange} className="w-full border p-2 rounded focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">Color</label>
          <input type="text" name="color" value={vehicle.color} onChange={handleInputChange} className="w-full border p-2 rounded focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">Mileage (km)</label>
          <input type="number" name="mileage" value={vehicle.mileage} onChange={handleInputChange} className="w-full border p-2 rounded focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">Mileage Allowance (km)</label>
          <input type="number" name="mileage_allowance" value={vehicle.mileage_allowance} onChange={handleInputChange} className="w-full border p-2 rounded focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">Ownership</label>
          <select name="ownership" value={vehicle.ownership} onChange={handleInputChange} className="w-full border p-2 rounded focus:border-blue-500">
            <option value="Company">Company</option>
            <option value="Private">Private</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Price per day ($)</label>
          <input type="number" name="price_per_day" value={vehicle.price_per_day} onChange={handleInputChange} className="w-full border p-2 rounded focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">Deposit ($)</label>
          <input type="number" name="deposit" value={vehicle.deposit} onChange={handleInputChange} className="w-full border p-2 rounded focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">Registration Number</label>
          <input type="text" name="registration_number" value={vehicle.registration_number} onChange={handleInputChange} className="w-full border p-2 rounded focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">Manufacture Year</label>
          <input type="number" name="manufacture_year" value={vehicle.manufacture_year} onChange={handleInputChange} className="w-full border p-2 rounded focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">Next Service Date</label>
          <input type="date" name="next_service_date" value={vehicle.next_service_date || ""} onChange={handleInputChange} className="w-full border p-2 rounded focus:border-blue-500" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Upload New Images</label>
          <input type="file" multiple onChange={handleFileChange} className="w-full border p-2 rounded focus:border-blue-500" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            {newImages.map((file, index) => (
              <div key={index} className="relative">
                <img src={URL.createObjectURL(file)} alt="New" className="w-full h-24 object-cover rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-medium mb-2">Existing Images</h3>
          <div className="grid grid-cols-3 gap-4">
            {existingImages.map((image) => (
              <div key={image.id} className="relative">
                <img src={image.image} alt="Vehicle" className="w-full h-24 object-cover rounded" />
                <button type="button" onClick={() => handleDeleteImage(image.id)} className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex space-x-4 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full md:w-auto"
            >
              Delete Vehicle
            </button>

            <button
              type="button"
              onClick={() => navigate("/fleet/vehicles")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg w-full md:w-auto"
            >
              Cancel
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full md:w-auto"
          >
            Update Vehicle
          </button>
        </div>

        </form>
      </div>
    </div>
  );
};

export default EditVehicle;
