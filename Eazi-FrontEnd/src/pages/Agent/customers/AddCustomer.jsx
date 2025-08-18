import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";



export default function AddCustomer() {
    const [licenseFile, setLicenseFile] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();
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
        drivers_license: null,
        next_of_kin1_first_name: "",
        next_of_kin1_last_name: "",
        next_of_kin1_id_number: "",
        next_of_kin1_phone: "",
        next_of_kin2_first_name: "",
        next_of_kin2_last_name: "",
        next_of_kin2_id_number: "",
        next_of_kin2_phone: "",
        last_booking_date: null,
    });
    const [licensePreview, setLicensePreview] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await axiosInstance.get(`customers/`);
            setCustomers(response.data);
        } catch (error) {
            console.error("Error fetching customers", error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
          setForm({ ...form, drivers_license: file });
          setLicensePreview(URL.createObjectURL(file));
        } else {
          setForm({ ...form, drivers_license: null });
          setLicensePreview(null);
          alert("Please select a valid image file (JPG, PNG, etc.).");
        }
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
    
        Object.keys(form).forEach((key) => {
            if (form[key] !== "" && form[key] !== null) {
                formData.append(key, form[key]);
            }
        });
    
        try {
            await axiosInstance.post(`customers/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
    
            // Show confirmation modal
            setIsSubmitted(true);
    
        } catch (error) {
            console.error("Error adding customer", error.response?.data || error);
        }
    };
    
    // Function to reset the form for adding another customer
    const addAnotherCustomer = () => {
        setForm({
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
            drivers_license: null,
            next_of_kin1_first_name: "",
            next_of_kin1_last_name: "",
            next_of_kin1_id_number: "",
            next_of_kin1_phone: "",
            next_of_kin2_first_name: "",
            next_of_kin2_last_name: "",
            next_of_kin2_id_number: "",
            next_of_kin2_phone: "",
            last_booking_date: null,
        });
        setIsSubmitted(false);
        setLicensePreview(null);  // Reset the license preview as well
    };
    
    // Function to navigate to the customers list
    const goToCustomerList = () => {
        navigate('/customers/list/'); // Change to the correct customer list route
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 shadow-md w-full">
                <h2 className="text-2xl font-semibold mb-4 text-center">Add Customer</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Customer Details */}
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:px-5">
                            {[
                                { name: "first_name", label: "First Name" },
                                { name: "last_name", label: "Last Name" },
                                { name: "phone_number", label: "Phone Number" },
                                { name: "email", label: "Email", type: "email" },
                                { name: "national_id", label: "National ID" },
                                { name: "street_address", label: "Street Address" },
                                { name: "address_line2", label: "Address Line 2", required: false },
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

                    {/* Driver's License Image */}
                    <label className="block mt-4 mb-2">Upload Driver's License (Image Only):</label>
                    <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border p-2 rounded"
                    />

                    {/* Image Preview */}
                    {licensePreview && (
                    <div className="mt-4">
                        <p className="text-gray-600">License Preview:</p>
                        <img
                        src={licensePreview}
                        alt="Driver's License Preview"
                        className="w-32 h-32 object-cover border rounded"
                        />
                    </div>
                    )}



                    <hr className="w-3/4 border-gray-300 my-6 mx-auto" />

                    {/* Next of Kin 1 */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Next of Kin 1</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: "next_of_kin1_first_name", label: "First Name" },
                                { name: "next_of_kin1_last_name", label: "Last Name" },
                                { name: "next_of_kin1_id_number", label: "ID Number" },
                                { name: "next_of_kin1_phone", label: "Phone Number" },
                            ].map(({ name, label }) => (
                                <div key={name}>
                                    <label htmlFor={name} className="block text-gray-700 font-medium">{label}</label>
                                    <input
                                        type="text"
                                        id={name}
                                        name={name}
                                        value={form[name]}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 transition"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr className="w-3/4 border-gray-300 my-6 mx-auto" />

                    {/* Next of Kin 2 */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Next of Kin 2</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: "next_of_kin2_first_name", label: "First Name" },
                                { name: "next_of_kin2_last_name", label: "Last Name" },
                                { name: "next_of_kin2_id_number", label: "ID Number" },
                                { name: "next_of_kin2_phone", label: "Phone Number" },
                            ].map(({ name, label }) => (
                                <div key={name}>
                                    <label htmlFor={name} className="block text-gray-700 font-medium">{label}</label>
                                    <input
                                        type="text"
                                        id={name}
                                        name={name}
                                        value={form[name]}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 transition"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-between">
                    <button type="button" onClick={goToCustomerList} className="px-4 py-2 bg-gray-500 text-white rounded">
                    Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                    Add Customer
                    </button>
                    </div>
                </form>
            </div>
            {isSubmitted && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-white/50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
                        <h3 className="text-lg font-semibold text-green-600">Customer Added!</h3>
                        <p className="text-gray-600 mt-2">What would you like to do next?</p>

                        <div className="mt-4 flex justify-center gap-3">
                            <button 
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                onClick={addAnotherCustomer}
                            >
                                Add Another Customer
                            </button>
                            <button 
                                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
                                onClick={goToCustomerList}
                            >
                                Customers List
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
