import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { MoreVertical } from "lucide-react";


function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "customer", direction: "ascending" });
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axiosInstance.get(`bookings`);
        setCustomers(res.data);
        setBookings(res.data);
      } catch (error) {
        console.error("Error fetching booking requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);
    

  const handleEdit = (id) => {
    navigate(`/edit-booking/${id}`);
  };

  const handleView = (id) => {
    navigate(`/booking-details/${id}`);
  };

  const toggleMenu = (id) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown") && !e.target.closest(".menu-btn")) {
        setMenuOpen(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    let aValue, bValue;

    if (sortConfig.key === "customer") {
      aValue = `${a.customer.first_name} ${a.customer.last_name}`;
      bValue = `${b.customer.first_name} ${b.customer.last_name}`;
    } else if (sortConfig.key === "vehicle") {
      aValue = `${a.vehicle.make} ${a.vehicle.model}`;
      bValue = `${b.vehicle.make} ${b.vehicle.model}`;
    } else {
      aValue = a[sortConfig.key];
      bValue = b[sortConfig.key];
    }

    if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const filteredBookings = sortedBookings.filter((booking) => {
    const fullName = `${booking.customer.first_name} ${booking.customer.last_name}`.toLowerCase();
    const vehicle = `${booking.vehicle.brand} ${booking.vehicle.model}`.toLowerCase();
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || vehicle.includes(query);
  });

  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-6 sm:py-4 md:mt-0 mt-5 overflow-hidden border">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-3">
        <h2 className="text-xl font-bold">Bookings</h2>
        <button
          onClick={() => navigate('/add-booking')}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 hidden md:block"
        >
          Add Booking
        </button>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-sm shadow-md py-0 mt-5 overflow-x-auto hidden md:block" style={{ height: 'calc(100vh - 100px)'   }}>
        <table className="w-full min-w-[600px]">
          <thead className="bg-blue-100 sticky top-0 z-10">
            <tr className="text-gray-600 font-bold text-lg">
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("customer")}>
                Customer {sortConfig.key === "customer" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("vehicle")}>
                Vehicle {sortConfig.key === "vehicle" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
              </th>
              <th className="p-2 text-left">Start Date</th>
              <th className="p-2 text-left">End Date</th>
              <th className="p-2 text-left">Amount $</th>
              <th className="p-2 text-left">Date Added</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="even:bg-gray-50 hover:bg-gray-100">
               <td className="p-3">
                {booking.customer_details?.first_name ? `${booking.customer_details.first_name} ${booking.customer_details.last_name}` : "N/A"}
                </td>
                <td className="p-3">
                {booking.vehicle_details?.make ? `${booking.vehicle_details.make} ${booking.vehicle_details.model}` : "N/A"}
                </td>
                <td className="p-3">{booking.start_date}</td>
                <td className="p-3">{booking.end_date}</td>
                <td className="p-3">${booking.booking_amount}</td>
                <td className="p-3">{new Date(booking.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-center relative">
                  <button onClick={() => toggleMenu(booking.id)} className="p-2">
                    <MoreVertical className="w-7 h-7 text-gray-500 menu-btn hover:text-black cursor-pointer" />
                  </button>

                  {menuOpen === booking.id && (
                    <div className="absolute right-18 top-2 mb-2 w-32 bg-white border rounded-sm shadow-lg z-10 dropdown">
                      <button
                        onClick={() => handleEdit(booking.id)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleView(booking.id)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200 cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card Layout for Mobile */}
      <div className="block md:hidden my-4">
        {/* Search for Mobile */}
        <div className="flex flex-col gap-4 mb-5">
          <input
            type="text"
            placeholder="Search by name, email, phone, or ID..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            id="sort"
            onChange={(e) => handleSort(e.target.value)}
            className="w-50 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <option value="">Sort By</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="created_at">Date Added</option>
          </select>
          <button
            onClick={() => navigate('/add-booking')}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 w-full cursor-pointer shadow-lg"
          >
            Add Booking
          </button>
        </div>
    
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white shadow-xl rounded-xl p-4 mb-4 relative">
            {/* 3 Dots Menu Button */}
            <button
              onClick={() => toggleMenu(booking.id)}
              className="absolute top-3 right-5 p-2 menu-btn"
            >
              <MoreVertical className="w-7 h-7 text-blue-600 rotate-90 hover:text-blue-400 cursor-pointer" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen === booking.id && (
              <div className="absolute top-12 right-4 w-32 bg-white border rounded-lg shadow-lg z-10 dropdown">
                <button
                  
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  View
                </button>
              </div>
              
            )}

            {/* Customer Details */}
            <div className="mt-4 p-4 space-y-2"> 
              <div className="flex justify-between mt-5">
                <span className="font-semibold text-gray-700">Customer</span>
                <span className="text-gray-700">{booking.customer_details.first_name}</span>
              </div>
              <div className="border-t-[0.5px] border-gray-300" />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Vehicle</span>
                <span className="text-gray-700">{booking.vehicle_details.make} {booking.vehicle_details.model}</span>
              </div>
              <div className="border-t-[0.5px] border-gray-300" />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Amount $</span>
                <span className="text-gray-700">{booking.booking_amount}</span>
              </div>
              <div className="border-t-[0.5px] border-gray-300" />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Date Added</span>
                <span className="text-gray-700">{new Date(booking.created_at).toLocaleDateString('en-GB')}</span>
              </div>
              {/* View Details Button */}
              <button
                
                className="mt-4 bg-white border border-blue-500 bored text-blue-500 py-2 px-4 rounded-lg hover:bg-blue-500 hover:text-white w-full cursor-pointer"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}

export default BookingList;
