import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../../components/BackButton";
import axiosInstance from "../../../api/axiosInstance";


const API_URL = "http://127.0.0.1:8000/api/staff/customers/";

export default function EditCustomer() {
    const { id } = useParams();
    const [licensePreview, setLicensePreview] = useState("");
    const [currentLicenseUrl, setCurrentLicenseUrl] = useState("");
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLicense, setDeleteLicense] = useState(false);
    const [form, setForm] = useState({
        title: "MR",
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        national_id: "",
        street_address: "",
        address_line2: "",
        city: "",
        country: "",
        drivers_license: "",
        next_of_kin1_first_name: "",
        next_of_kin1_last_name: "",
        next_of_kin1_id_number: "",
        next_of_kin1_phone: "",
        next_of_kin2_first_name: "",
        next_of_kin2_last_name: "",
        next_of_kin2_id_number: "",
        next_of_kin2_phone: "",
    });
    const navigate = useNavigate();
    const [initialForm, setInitialForm] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [changes, setChanges] = useState([]);
    const [modalImage, setModalImage] = useState("");

    useEffect(() => {
        fetchCustomerData();
    }, []);

    
    const fetchCustomerData = async () => {
        try {
        const response = await axiosInstance.get(`customers/${id}/`);
        setForm(response.data);
        setInitialForm(response.data);
        if (response.data.drivers_license) {
            setCurrentLicenseUrl(response.data.drivers_license);
        }
        } catch (error) {
        console.error("Error fetching customer data", error);
        }
    };
      

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

   const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (JPG, PNG, etc.).");
        return;
        }
        if (file.size > 5 * 1024 * 1024) {
        alert("File size should not exceed 5MB.");
        return;
        }
        setForm({ ...form, drivers_license: file });
        setLicensePreview(URL.createObjectURL(file));
    }
    };

    const findChanges = () => {
        const detectedChanges = [];
        Object.keys(form).forEach((key) => {
          if (key === "drivers_license") {
            if (form[key] !== initialForm[key]) {
              detectedChanges.push("Driver's License updated.");
            }
          } else if (form[key] !== initialForm[key]) {
            detectedChanges.push(`${key.replace(/_/g, " ")}: ${initialForm[key]} → ${form[key]}`);
          }
        });
        setChanges(detectedChanges);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        findChanges();
    };
    
    
    const confirmSubmit = async () => {
        try {
            if (deleteLicense) {
                // ✅ First, delete the driver's license if requested
                await axiosInstance.delete(`customers/${id}/delete_drivers_license/`);
                console.log("Driver's license deleted successfully.");
            }
    
            const formData = new FormData();
    
            Object.keys(form).forEach((key) => {
                if (key === "drivers_license") {
                    // ✅ Only add the file if it's a new upload
                    if (form[key] instanceof File) {
                        formData.append(key, form[key]);
                    }
                } else if (form[key] !== null && form[key] !== undefined) {
                    formData.append(key, form[key]);
                }
            });
    
            // ✅ Then, send the update request
            await axiosInstance.patch(`customers/${id}/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });
    
            alert("Customer updated successfully!");
            navigate("/customers/list/");
        } catch (error) {
            console.error("Error updating customer", error);
            if (error.response) {
                alert(`Error: ${JSON.stringify(error.response.data)}`);
            }
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleImageClick = (imageSrc) => {
        setModalImage(imageSrc);
        setIsImageModalOpen(true);
      };

      const ImageModal = ({ imageSrc, onClose }) => (
        <div className="min-h-screen fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm z-50">
          <div className="relative p-2">
            <button
            onClick={onClose}
            className="absolute cursor-pointer top-4 right-4 text-white text-sm font-semibold bg-gray-800 bg-opacity-70 rounded-full px-4 py-2 hover:bg-gray-600"
            >
            Close
            </button>
            <img src={imageSrc} alt="Expanded Driver's License" className="max-w-full max-h-[90vh] rounded-lg" />
          </div>
        </div>
      );

      const handleDeleteCustomer = async () => {
        try {
          await axiosInstance.delete(`customers/${id}/`);
          setIsDeleteModalOpen(false); // Close modal
          navigate("/customers/list"); // Redirect to vehicle list after deletion
        } catch (err) {
          console.error("Error deleting customer:", err);
        }
      };
      const goToCustomerList = () => {
        navigate('/customers/list/'); // Change to the correct customer list route
    };

    const toCamelCase = (str) => {
        return str
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const handleDeleteImage = () => {
        setLicensePreview(null); // Clear new image preview
        setCurrentLicenseUrl(null); // Clear existing image URL
        setDeleteLicense(true);  // ✅ Mark image for deletion
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 md:px-8 py-6 mt-16 md:mt-0">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
                <div className="py-5 flex items-center relative border-b mb-5">
                    <BackButton className="absolute left-0" />
                    <h2 className="text-2xl font-semibold mx-auto">Edit Customer</h2>
                </div>

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm z-50 ">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative z-50">
                            <h3 className="text-lg font-semibold mb-4 text-red-600">Confirm Delete</h3>
                            <p className="text-gray-700">Are you sure you want to delete this customer? This action cannot be undone.</p>
                            <div className="mt-4 flex justify-end space-x-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCustomer}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                            >
                                Delete
                            </button>
                            </div>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                    {/* Customer Details */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { name: "title", label: "Title" },
                            { name: "first_name", label: "First Name" },
                            { name: "last_name", label: "Last Name" },
                            { name: "phone_number", label: "Phone Number" },
                            { name: "email", label: "Email", type: "email" },
                            { name: "national_id", label: "National ID" },
                            { name: "street_address", label: "Street Address" },
                            { name: "address_line2", label: "Apartment, etc. (Optional)", required: false },
                            { name: "city", label: "City" },
                            { name: "country", label: "Country" },
                            ].map(({ name, label, type = "text" }) => (
                            <div key={name}>
                                <label htmlFor={name} className="block text-gray-700 font-medium">{label}</label>
                                <input
                                type={type}
                                id={name}
                                name={name}
                                value={form[name]}
                                onChange={handleChange}
                                required={name !== "address_line2"}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 transition"
                                />
                            </div>
                            ))}
                        </div>
                    </div>

                    {/* Driver's License Image Input */}
                    <label className="block mt-4 mb-2">Update Driver's License (Optional):</label>
                    <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border p-2 rounded"
                    />


                    {/* Image Preview (New or Existing) */}
                    <div className="mt-4">
                        {licensePreview ? (
                            <>
                            <p className="text-gray-600">New License Preview (Click to Expand):</p>
                            <div className="relative inline-block">
                                <img
                                src={licensePreview}
                                alt="New Driver's License Preview"
                                className="w-32 h-32 object-cover border rounded cursor-pointer"
                                onClick={() => handleImageClick(licensePreview)}
                                />
                                {/* Delete Button */}
                                <button
                                    type="button"
                                    onClick={handleDeleteImage}
                                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                                >
                                    X
                                </button>
                            </div>
                        </>
                        ) : currentLicenseUrl ? (
                        <>
                            <p className="text-gray-600">Current License (Click to Expand)</p>
                            <div className="relative inline-block">
                                <img
                                src={currentLicenseUrl}
                                alt="Existing Driver's License"
                                className="w-32 h-32 object-cover border rounded cursor-pointer"
                                onClick={() => handleImageClick(currentLicenseUrl)}
                                />
                                {/* Delete Button */}
                                <button
                                    type="button"
                                    onClick={handleDeleteImage}
                                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                                >
                                    X
                                </button>
                            </div>
                        </>
                    ) : (
                    <p className="text-gray-600">No driver's license uploaded yet.</p>
                    )}
                </div>

                {/* Render Image Modal if open */}
                {isImageModalOpen && (
                <ImageModal
                    imageSrc={modalImage}
                    onClose={() => setIsImageModalOpen(false)}
                />
                )}




                {/* Next of Kin 1 and 2 */}
                {[1, 2].map((kin) => (
                    <div key={kin}>
                        <h3 className="text-lg font-semibold mb-2">Next of Kin {kin}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {["first_name", "last_name", "id_number", "phone"].map((field) => (
                                <div key={field}>
                                    <label htmlFor={`next_of_kin${kin}_${field}`} className="block text-gray-700 font-medium">{toCamelCase(field)}</label>
                                    <input
                                        type="text"
                                        id={`next_of_kin${kin}_${field}`}
                                        name={`next_of_kin${kin}_${field}`}
                                        value={form[`next_of_kin${kin}_${field}`] || ""}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="md:col-span-2 flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex space-x-4 w-full md:w-auto">
                        <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full md:w-auto cursor-pointer"
                        >
                        Delete Customer
                        </button>

                        <button
                        type="button"
                        onClick={() => navigate("/customers/list")}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg w-full md:w-auto cursor-pointer"
                        >
                        Cancel
                        </button>
                    </div>

                    <button
                        type="submit"
                        onClick={() => confirmSubmit()}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full md:w-auto cursor-pointer"
                    >
                        Update Customer
                    </button>
                </div>


                </form>
                {/* Confirmation Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4 cursor-pointer">Confirm Changes</h3>
                            {changes.length > 0 ? (
                            <ul className="list-disc pl-5 mb-4">
                                {changes.map((change, index) => (
                                <li key={index}>{change}</li>
                                ))}
                            </ul>
                            ) : (
                            <p>No changes detected.</p>
                            )}
                            <div className="flex justify-end space-x-4">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded cursor-pointer">Continue Editing</button>
                                <button onClick={goToCustomerList}className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer">Customer List</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
