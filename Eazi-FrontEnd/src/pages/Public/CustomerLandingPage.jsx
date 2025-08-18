import { useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import axiosInstance from '../../../src/api/axiosInstance';



const CustomerLandingPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { load } = useContext(AuthContext);
  const location = useLocation();

  console.log("User in Landing Page:", user); 

  // 👇 If not exactly on "/", DO NOTHING
  if (location.pathname !== "/") {
    return null;
  }

  // Redirect if a non-customer user is logged in
  useEffect(() => {
    if (!load && user && user.role) {
      if (user.role === "staff" || user.role === "agent" || user.role === "agency") {
        navigate("/staff/dashboard");
      }
    }
  }, [user, loading, navigate]);


  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axiosInstance.get("/public-vehicles");
        setVehicles(response.data);
        setFilteredVehicles(response.data); // Initialize filtered list
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchVehicles();
  }, []);

  // Filter vehicles based on searchQuery and ownershipFilter
  useEffect(() => {
    let filtered = vehicles;

    if (searchQuery) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.color.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (ownershipFilter) {
      filtered = filtered.filter((vehicle) => vehicle.ownership === ownershipFilter);
    }

    setFilteredVehicles(filtered);
  }, [searchQuery, ownershipFilter, vehicles]);

  if (loading) return <p className="text-center text-gray-500">Loading vehicles...</p>;

  return (
    <div className="w-full min-h-screen px-4">
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center my-4 gap-4">
        <h2 className="text-2xl font-semibold">Available Vehicles</h2>
        <input
          type="text"
          placeholder="Search by make, model, or color..."
          className="border border-gray-300 px-4 py-2 rounded-lg w-full md:w-80"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="border border-gray-300 px-4 py-2 rounded-lg w-full md:w-40"
          value={ownershipFilter}
          onChange={(e) => setOwnershipFilter(e.target.value)}
        >
          <option value="">All Ownerships</option>
          <option value="company">Company-owned</option>
          <option value="private">Privately-owned</option>
        </select>
      </div>

      {/* Vehicle List */}
      {filteredVehicles.length === 0 ? (
        <p className="text-gray-500">No vehicles found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
};



const VehicleCard = ({ vehicle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % vehicle.images.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? vehicle.images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition h-[440px] flex flex-col bg-white">
      {/* Image Section */}
      <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
        {vehicle.images.length > 0 ? (
          <img
            src={vehicle.images[currentImageIndex].image}
            alt={vehicle.model}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
        )}
        {vehicle.images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white px-2 py-1 rounded-full"
              onClick={handlePrev}
            >
              &#10094;
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white px-2 py-1 rounded-full"
              onClick={handleNext}
            >
              &#10095;
            </button>
          </>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{vehicle.make} {vehicle.model}</h3>
          <p className="text-sm text-gray-600">Color: {vehicle.color}</p>
          <p className="text-sm text-gray-600">Mileage: {vehicle.mileage} km</p>
          <p className="text-sm text-gray-800 mt-1 font-medium"> ${vehicle.price_per_day} / day</p>
        </div>

        {/* Agency Section */}
        {vehicle?.agency_logo ? (
          <div className="mt-3 flex items-center gap-2 bg-green-100 p-2 rounded-md w-fit">
            <img
              src={vehicle.agency_logo}
              alt={vehicle.agency_name || "Agency"}
              className="w-10 h-10 rounded-full object-cover border"
            />
            <span className="text-sm font-medium text-gray-700">
              {vehicle.agency_name || "Unknown Agency"}
            </span>
          </div>
        ) : (
          <div className="mt-3 text-xs text-gray-400 italic">
            No agency information
          </div>
        )}

      </div>
    </div>
  );
};


export default CustomerLandingPage;
