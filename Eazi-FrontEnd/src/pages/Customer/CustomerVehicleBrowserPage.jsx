import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../src/contexts/AuthContext";
import axiosInstance from "../../api/axiosInstance";

const CustomerVehicleBrowserPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axiosInstance.get(`/public-vehicles`);
        setVehicles(response.data);
        setFilteredVehicles(response.data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

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
      <div className="flex flex-col md:flex-row justify-between items-center my-4 gap-4">
        <h2 className="text-2xl font-semibold">Browse & Book Vehicles</h2>
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
  const navigate = useNavigate();

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % vehicle.images.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? vehicle.images.length - 1 : prevIndex - 1
    );
  };

  const handleBookNow = () => {
    navigate(`/public-customers/book-vehicle/${vehicle.id}`);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition h-[440px] flex flex-col">
      <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
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
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full"
              onClick={handlePrev}
            >
              &#10094;
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full"
              onClick={handleNext}
            >
              &#10095;
            </button>
          </>
        )}
      </div>
      <div className="p-4 flex-1">
        <h3 className="text-lg font-semibold">{vehicle.make} {vehicle.model}</h3>
        <p className="text-sm text-gray-600">Color: {vehicle.color}</p>
        <p className="text-sm text-gray-600">Mileage: {vehicle.mileage} km</p>
        <p className="text-sm text-gray-600 mb-3">Price: ${vehicle.price_per_day}/day</p>
        <button
          className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleBookNow}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default CustomerVehicleBrowserPage;
