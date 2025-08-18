import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import BackButton from "../../../components/BackButton";
import WhatsappButton from "../../../components/WhatsappButton";
import BookingCarousel from "../../../components/BookingsCarousel";
import { Car, DollarSign, Gauge } from 'lucide-react'
import axiosInstance from "../../../api/axiosInstance";


function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [customer, setCustomer] = useState("");
  const [activeTab, setActiveTab] = useState("customer");
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});
  
  
  const toggleDropdown = (id) => {
    setOpenDropdownId(prev => (prev === id ? null : id));
  };
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    totalSpent: 0,
    totalMileage: 0
});




useEffect(() => {
  setLoading(true); // Start loading
  axiosInstance.get(`customers/${id}/`)
      .then(response => setCustomer(response.data))
      .catch(error => console.error("Error fetching customer:", error));

  axiosInstance.get(`bookings/customer/${id}/`)
      .then(response => {
        setBookings(response.data);
        setLoading(false); // Stop loading
      })
      .catch(error => {
        console.error("Error fetching bookings:", error);
        setLoading(false); // Stop loading even on error
      });

  axiosInstance.get(`customers/${id}/analytics/`)
      .then(response => setAnalytics(response.data))
      .catch(error => console.error("Error fetching analytics:", error));

      const handleClickOutside = (event) => {
        const clickedInsideAny = Object.values(dropdownRefs.current).some(
          (ref) => ref && ref.contains(event.target)
        );
        if (!clickedInsideAny) {
          setOpenDropdownId(null);
        }
      };
    
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
  

const handleCreateInvoice = (bookingId) => {
  console.log("Create invoice for booking:", bookingId);
  // navigate(`/invoices/create?bookingId=${bookingId}`);
};

const handleViewBooking = (bookingId) => {
  console.log("View booking:", bookingId);
  // navigate(`/bookings/view/${bookingId}`);
};

const handleEditBooking = (bookingId) => {
  console.log("Edit booking:", bookingId);
  // navigate(`/bookings/edit/${bookingId}`);
};





  return (
    <div className='w-full min-h-screen overflow-hidden bg-gray-50'> 
      <div className="p-4">
        <BackButton />
      </div>
      <div className="container mx-auto p-1 flex flex-col md:flex-row gap-6 "style={{ minHeight: 'calc(100vh - 100px)', overflowY: 'auto'  }}>
        {/* Left Section - Customer Details */}
        <div className="md:w-1/3 flex flex-col gap-6">


          <div className="w-full max-w-lg mx-auto">
            {/* Mini Navigation Bar */}
            <div className="flex justify-between bg-blue-600 text-white font-semibold text-lg p-1 rounded-t-md">
              {["customer", "kin1", "kin2"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-center py-2 cursor-pointer ${
                    activeTab === tab ? "bg-blue-800" : "bg-blue-600"
                  } transition-colors duration-200 rounded-md`}
                >
                  {tab === "customer" ? "Customer" : tab === "kin1" ? "Kin 1" : "Kin 2"}
                </button>
              ))}
            </div>

            {/* Content Display */}
            <div className="p-4 bg-white rounded-b-lg shadow-md">
              {activeTab === "customer" && (
                <div>
                  <WhatsappButton phoneNumber={customer.phone_number} />
                  <div className='mt-3 p-4 space-y-2'>
                    <div className='flex justify-between'>
                      <span className="font-bold">Title:</span>
                      <span className="text-gray-700">{customer.title} </span>
                    </div>
                    <div className="border-t-[0.5px] border-gray-300" />
                    <div className='flex justify-between mt-5'>
                      <span className="font-bold">Name:</span>
                      <span className="text-gray-700">{customer.first_name} {customer.last_name} </span>
                    </div>
                    <div className="border-t-[0.5px] border-gray-300" />
                    <div className='flex justify-between mt-5'>
                      <span className="font-bold">Phone Number:</span>
                      <span className="text-gray-700">{customer.phone_number} </span>
                    </div>
                    <div className="border-t-[0.5px] border-gray-300" />
                    <div className='flex justify-between mt-5'>
                      <span className="font-bold">Email:</span>
                      <span className="text-gray-700">{customer.email} </span>
                    </div>
                    <div className="border-t-[0.5px] border-gray-300" />
                    <div className='flex justify-between mt-5'>
                      <span className="font-bold">National ID:</span>
                      <span className="text-gray-700">{customer.national_id} </span>
                    </div>
                    <div className="border-t-[0.5px] border-gray-300" />
                    <div className='mt-3'>
                      <span className="font-bold block">Address:</span>
                      <span className="text-gray-700 block">
                      {customer.street_address ? `${customer.street_address}, ` : ''}
                      {customer.address_line2 ? ` ${customer.address_line2}` : ''}
                      {customer.city ? `${customer.city},` : ''}
                      {customer.country ? ` ${customer.country}` : ''}
                      </span>
                    </div>
                    <div className="border-t-[0.5px] border-gray-300" />
                    <div className='flex justify-between mt-5'>
                      <span className="font-bold">Date Added:</span>
                      <span className="text-gray-700"> {new Date(customer.created_at).toLocaleDateString("en-GB")}</span>
                    </div>
                    <div className="border-t-[0.5px] border-gray-300" />
                    <div className='flex justify-between mt-5'>
                      <span className="font-bold">Last Booking Date:</span>
                      <span className="text-gray-700"> {customer.last_booking_date ? new Date(customer.last_booking_date).toLocaleDateString("en-GB") : "N/A"}</span>
                    </div>
                    <div className="border-t-[0.5px] border-gray-300" />
                    
        
                      <p><strong>Drivers License:</strong></p>
                      <img src={customer.drivers_license} alt="Drivers License" className="w-50 h-auto rounded-md text-orange-500" />
                  </div>
              </div>
              )}

              {activeTab === "kin1" && (
                <div>
                  {customer?.next_of_kin1_first_name? (  // Apply optional chaining (?.)
                    <>
                      <div className='mt-3 p-4 space-y-2'>
                        <div className='flex justify-between'>
                          <span className="font-bold">Name:</span>
                          <span className="text-gray-700"> {customer.next_of_kin1_first_name} {customer.next_of_kin1_last_name}</span>
                        </div>
                        <div className="border-t-[0.5px] border-gray-300" />
                        <div className='flex justify-between'>
                          <span className="font-bold">Phone Number:</span>
                          <span className="text-gray-700">{customer.next_of_kin1_phone}</span>
                        </div>
                        <div className="border-t-[0.5px] border-gray-300" />
                        <div className='flex justify-between'>
                          <span className="font-bold">ID Number:</span>
                          <span className="text-gray-700">{customer.next_of_kin1_id_number}</span>
                        </div>
                        <div className="border-t-[0.5px] border-gray-300" />
                      </div>
                    </>
                  ) : (
                    <p className="text-orange-500 mt-3 text-center">No Next of Kin 1 provided.</p>
                  )}
                </div>
              )}

              {activeTab === "kin2" && (
                <div>
                  {customer?.next_of_kin_2 ? (  // Apply optional chaining (?.)
                    <>
                      <div className='mt-3 p-4 space-y-2'>
                        <div className='flex justify-between'>
                          <span className="font-bold">Name:</span>
                          <span className="text-gray-700"> {customer.next_of_kin2_first_name} {customer.next_of_kin2_last_name}</span>
                        </div>
                        <div className="border-t-[0.5px] border-gray-300" />
                        <div className='flex justify-between'>
                          <span className="font-bold">Phone Number:</span>
                          <span className="text-gray-700">{customer.next_of_kin2_phone}</span>
                        </div>
                        <div className="border-t-[0.5px] border-gray-300" />
                        <div className='flex justify-between'>
                          <span className="font-bold">ID Number:</span>
                          <span className="text-gray-700">{customer.next_of_kin2_id_number}</span>
                        </div>
                        <div className="border-t-[0.5px] border-gray-300" />
                      </div>
                    </>
                  ) : (
                    <p className="text-orange-500 mt-3 text-center">No Next of Kin 2 provided.</p>
                  )}
                </div>
              )}
            </div>
          </div>


        </div>
        {/* Right Section - Analytics, Financials, and Booking History Table */}
        <div className="md:w-2/3 flex flex-col gap-6">
          {/* Customer Analytics with 3 columns */}
          <div className="p-6 bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold italic text-center mb-6 tracking-tight text-gray-700">Customer Analytics</h2>
            <div className="grid md:grid-cols-3 grid-cols-2 gap-4">
              
              {/* Total Bookings */}
              <div className="bg-gradient-to-br from-orange-100 to-orange-300 p-4 rounded-xl shadow-md hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-4">
                  <Car className="w-5 h-5 text-orange-500" />
                  <h3 className="text-sm font-medium text-gray-700">Total Bookings</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{analytics.totalBookings}</p>
              </div>

              {/* Total Spending */}
              <div className="bg-gradient-to-br from-green-100 to-green-300 p-4 rounded-xl shadow-md hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="text-sm font-medium text-gray-700">Total Spending</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">${analytics.totalSpent.toFixed(2)}</p>
              </div>

              {/* Total Mileage */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-300 p-4 rounded-xl shadow-md hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-4">
                  <Gauge className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm font-medium text-gray-700">Total Mileage</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{analytics.totalMileage ? `${analytics.totalMileage}km` : '0km'}</p>
              </div>

            </div>
          </div>


          <div className="bg-white p-6 rounded-xl shadow-md hidden md:block h-[500px] flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Booking History</h2>

            {loading ? (
              <p>Loading...</p>
            ) : bookings.length === 0 ? (
              <p className='text-orange-500'>No bookings found for this customer.</p>
            ) : (
              <div className="overflow-x-auto h-100 flex flex-col">
                <div className="flex-grow overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left">Booking ID</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Mileage</th>
                        <th className="px-4 py-3 text-left">Payment Method</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="even:bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700">
                          <td className="px-4 py-2">{booking.id}</td>
                          <td className="px-4 py-2">
                            {new Date(booking.created_at).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-4 py-2 font-mono">${booking.booking_amount}</td>
                          <td className="px-4 py-2 font-mono">{booking.estimated_mileage}km</td>
                          <td className="px-4 py-2 font-mono font-semibold">{booking.payment_method}</td>
                          <td className="px-4 py-2">
                            <span className={`
                              px-3 py-1 rounded-full text-xs font-semibold 
                              ${booking.booking_status === 'completed' ? 'bg-green-100 text-green-700' : 
                                booking.booking_status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' : 
                                booking.booking_status === 'active' ? 'bg-blue-500 text-white' :
                                'bg-red-100 text-red-700'}
                            `}>
                              {booking.booking_status}
                            </span>
                          </td>
                          <td 
                          ref={(el) => (dropdownRefs.current[booking.id] = el)}
                          className="px-4 py-2 text-left relative">
                            <button
                              onClick={() => toggleDropdown(booking.id)}
                              className="text-gray-600 hover:text-black focus:outline-none"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>

                            {openDropdownId === booking.id && (
                              <div 
                                className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-20">
                                <button
                                  onClick={() => handleCreateInvoice(booking.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Create Invoice
                                </button>
                                <button
                                  onClick={() => handleViewBooking(booking.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  View Booking
                                </button>
                                <button
                                  onClick={() => handleEditBooking(booking.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Edit Booking
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>


          


          {/* Mobile Cards */}

          <div className="md:hidden bg-white rounded-xl shadow-md bg-yellow-50">    
          <BookingCarousel
            bookings={bookings}
            openDropdownId={openDropdownId}
            toggleDropdown={toggleDropdown}
            handleViewBooking={handleViewBooking}
            handleEditBooking={handleEditBooking}
            handleCreateInvoice={handleCreateInvoice}
          />
          </div>
        </div>
      </div>
    </div>
    );
}

export default CustomerDetails;
