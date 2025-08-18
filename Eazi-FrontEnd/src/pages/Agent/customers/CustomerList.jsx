import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";


function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get("customers/");
        setCustomers(response.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);


  const handleEdit = (id) => {
    navigate(`/edit-customer/${id}`);
  };

  const handleView = (id) => {
    navigate(`/details/${id}`);
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
    if (!key) return; // If no key selected, do nothing
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    const aValue =
      sortConfig.key === "name" ? `${a.first_name} ${a.last_name}` : a[sortConfig.key];
    const bValue =
      sortConfig.key === "name" ? `${b.first_name} ${b.last_name}` : b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const filteredCustomers = sortedCustomers.filter((customer) => {
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
    const email = customer.email?.toLowerCase() || "";
    const phone = customer.phone_number?.toLowerCase() || "";
    const nationalId = customer.national_id?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
  
    return (
      fullName.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      nationalId.includes(query)
    );
  });
  
  
  if (loading) return <p className="text-center text-gray-500">Loading vehicles...</p>;

  
  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-6 sm:py-4 md:mt-0 mt-5 overflow-hidden border">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-3">
        {/* Header */}
        <h2 className="text-xl font-bold">Customers</h2>

        {/* Search Input and Button */}
        <div className="hidden md:flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by name, email, phone, or ID..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <button
            onClick={() => navigate('/add-customer')}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 hidden md:block cursor-pointer"
          >
            Add Customer
          </button>
        </div>
      </div>

      {/* Table for Desktop */}
      <div className="bg-white rounded-sm shadow-md py-0 mt-5 overflow-x-auto hidden md:block" style={{ height: 'calc(100vh - 100px)'   }}>
        <table className="w-full min-w-[600px]">
          <thead className="sticky top-0 bg-blue-100 z-10">
            <tr className="text-gray-600 font-bold text-lg bg-blue-100">
              <th
                className="p-3 text-left cursor-pointer hover:text-black"
                onClick={() => handleSort("name")}
              >
                Name {sortConfig.key === "name" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
              </th>
              <th
                className="p-3 text-left cursor-pointer hover:text-black"
                onClick={() => handleSort("email")}
              >
                Email {sortConfig.key === "email" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
              </th>
            
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">National ID</th>
              <th
                className="p-3 text-left cursor-pointer hover:text-black"
                onClick={() => handleSort("created_at")}
              >
                Date Added {sortConfig.key === "created_at" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
              </th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="overflow-y-auto" style={{ overflowY: 'auto' }}>
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                className="even:bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  // Prevent redirect if click comes from inside the Actions column
                  if (!e.target.closest('.dropdown') && !e.target.closest('.menu-btn')) {
                    navigate(`/details/${customer.id}`);
                  }
                }}>
                <td className="p-3">{customer.first_name} {customer.last_name} </td>
                <td className="p-3">{customer.email}</td>
                <td className="p-3">{customer.phone_number}</td>
                <td className="p-3">{customer.national_id}</td>
                <td className="p-3"> {new Date(customer.created_at).toLocaleDateString('en-GB')}</td>
                <td className="p-3 text-center relative">
                <button onClick={() => toggleMenu(customer.id)} className="p-2">
                  <MoreVertical className="w-7 h-7 text-gray-500 menu-btn hover:text-black cursor-pointer" />
                  </button>

                  {menuOpen === customer.id && (
                    <div className="absolute right-18 top-2 mb-2 w-32 bg-green-100 border rounded-sm shadow-lg z-10 dropdown">
                      <button
                        onClick={() => handleEdit(customer.id)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-200 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/details/${customer.id}`)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-200 cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/add-booking?customerId=${customer.id}`)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-200 cursor-pointer"
                      >
                        Add Booking
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
            onClick={() => navigate('/add-customer')}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 w-full cursor-pointer shadow-lg"
          >
            Add Customer
          </button>
        </div>
    
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white shadow-xl rounded-xl p-4 mb-4 relative">
            {/* 3 Dots Menu Button */}
            <button
              onClick={() => toggleMenu(customer.id)}
              className="absolute top-3 right-5 p-2 menu-btn"
            >
              <MoreVertical className="w-7 h-7 text-blue-600 rotate-90 hover:text-blue-400 cursor-pointer" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen === customer.id && (
              <div className="absolute top-12 right-4 w-32 bg-white border rounded-lg shadow-lg z-10 dropdown">
                <button
                  onClick={() => handleEdit(customer.id)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/details/${customer.id}`)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  View
                </button>
              </div>
              
            )}

            {/* Customer Details */}
            <div className="mt-4 p-4 space-y-2"> 
              <div className="flex justify-between mt-5">
                <span className="font-semibold text-gray-700">Name</span>
                <span className="text-gray-700">{customer.first_name} {customer.last_name} </span>
              </div>
              <div className="border-t-[0.5px] border-gray-300" />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Email</span>
                <span className="text-gray-700">{customer.email}</span>
              </div>
              <div className="border-t-[0.5px] border-gray-300" />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Phone</span>
                <span className="text-gray-700">{customer.phone_number}</span>
              </div>
              <div className="border-t-[0.5px] border-gray-300" />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Date Added</span>
                <span className="text-gray-700">{new Date(customer.created_at).toLocaleDateString('en-GB')}</span>
              </div>
              {/* View Details Button */}
              <button
                 onClick={() => navigate(`/details/${customer.id}`)}
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

export default CustomerList;
