import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import BackButton from "../../../components/BackButton";
import axiosInstance from "../../../api/axiosInstance";





const AddBooking = () => {
    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const prefilledCustomerId = queryParams.get("customerId");
    const [formData, setFormData] = useState({
        customer: prefilledCustomerId || "",
        vehicle: "",
        start_date: "",
        end_date: "",
        booking_amount: "",
        booking_deposit: "",
        payment_method: "cash",
        booking_status: "pending",
        estimated_mileage: "",
        discount_amount: "0.00",
        discount_description: "",
        pickup_location: "",
        dropoff_location: "",
        pickup_time: "09:00",
        dropoff_time: "18:00",
        notes: ""
    });

    useEffect(() => {
        axiosInstance.get(`customers/`)
            .then(response => setCustomers(response.data))
            .catch(error => console.error("Error fetching customers:", error));

        axiosInstance.get(`staff-vehicles/`)
            .then(response => setVehicles(response.data))
            .catch(error => console.error("Error fetching vehicles:", error));
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Disable button while submitting
    
        const bookingData = {
            customer: formData.customer ? parseInt(formData.customer) : null,
            vehicle: formData.vehicle ? parseInt(formData.vehicle) : null,
            start_date: formData.start_date,
            end_date: formData.end_date,
            booking_amount: formData.booking_amount,
            booking_deposit: formData.booking_deposit,
            payment_method: formData.payment_method,
            booking_status: formData.booking_status,
            estimated_mileage: formData.estimated_mileage,
            discount_amount: formData.discount_amount,
            discount_description: formData.discount_description,
            pickup_location: formData.pickup_location,
            dropoff_location: formData.dropoff_location,
            pickup_time: formData.pickup_time,
            dropoff_time: formData.dropoff_time,
            notes: formData.notes
        };
    
        try {
            const response = await axiosInstance.post(
                `bookings/`,
                bookingData
            );
            console.log("Booking created:", response.data);
            alert("Booking successfully created!");
            setFormData({ ...formData, customer: "", vehicle: "" }); // Reset form if needed
        } catch (error) {
            console.error("Error creating booking:", error);
            alert("Failed to create booking. Please check your input.");
        } finally {
            setLoading(false); // Re-enable button
        }
    };

    const goToBookingList = () => {
        navigate('/bookings/list'); // Change to the correct customer list route
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-4 shadow-md w-full">
            <div className="">
                <BackButton />
            </div>
                <h2 className="text-2xl font-semibold mb-4 text-center">Add Booking</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Customer & Vehicle Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium">Select Customer:</label>
                            <select name="customer" value={formData.customer} onChange={handleChange} className="p-2 border rounded w-full">
                                <option value="">-- Choose Customer --</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.first_name} {customer.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Select Vehicle:</label>
                            <select name="vehicle" value={formData.vehicle} onChange={handleChange} className="p-2 border rounded w-full">
                                <option value="">-- Choose Vehicle --</option>
                                {vehicles.map((vehicle) => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.make} {vehicle.model} ({vehicle.registration_number})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium">Start Date:</label>
                            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">End Date:</label>
                            <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="p-2 border rounded w-full" />
                        </div>
                    </div>

                    {/* Pickup & Dropoff  Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium">Pickup Time:</label>
                            <input type="time" name="pickup_time" value={formData.pickup_time} onChange={handleChange} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Dropoff Time:</label>
                            <input type="time" name="dropoff_time" value={formData.dropoff_time} onChange={handleChange} className="p-2 border rounded w-full" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium">Pickup Location:</label>
                            <input type="text" name="pickup_location" value={formData.pickup_location} onChange={handleChange} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Dropoff Location:</label>
                            <input type="text" name="dropoff_location" value={formData.dropoff_location} onChange={handleChange} className="p-2 border rounded w-full" />
                        </div>
                    </div>

                    {/* Booking amount and Booking deposit Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium">Booking Amount:</label>
                            <input type="number" name="booking_amount" value={formData.booking_amount} onChange={handleChange} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Booking Deposit:</label>
                            <input type="number" name="booking_deposit" value={formData.booking_deposit} onChange={handleChange} className="p-2 border rounded w-full" />
                        </div>
                    </div>

                    {/* Payment & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium">Payment Method:</label>
                            <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="p-2 border rounded w-full">
                                <option value="cash">Cash</option>
                                <option value="mobile transfer">Mobile Transfer</option>
                                <option value="debit_card">Debit Card</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Booking Status:</label>
                            <select name="booking_status" value={formData.booking_status} onChange={handleChange} className="p-2 border rounded w-full">
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                            </select>
                        </div>
                    </div>

                    {/* Estimated mileage and destination Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium">Estimated Mileage</label>
                            <input type="number" name="estimated_mileage" value={formData.estimated_mileage} onChange={handleChange} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Discount Amount:</label>
                            <input type="number" name="discount_amount" value={formData.discount_amount} onChange={handleChange} className="p-2 border rounded w-full" />
                        </div>
                    </div>
 
                    {/* Notes */}
                    <div>
                        <label className="block text-gray-700 font-medium">Notes:</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} className="p-2 border rounded w-full"></textarea>
                    </div>

                    <div className="flex justify-between">
                        <button type="button" onClick={goToBookingList} className="px-4 py-2 bg-gray-500 text-white rounded">
                        Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                        Add Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBooking;
