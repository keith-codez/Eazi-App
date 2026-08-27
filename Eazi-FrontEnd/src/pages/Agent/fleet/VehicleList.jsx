import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import axiosInstance from "../../../api/axiosInstance";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axiosInstance.get("staff-vehicles/");
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
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.make?.toLowerCase().includes(q) ||
          v.model?.toLowerCase().includes(q) ||
          v.color?.toLowerCase().includes(q) ||
          v.registration_number?.toLowerCase().includes(q)
      );
    }

    if (ownershipFilter) {
      filtered = filtered.filter((v) => v.ownership === ownershipFilter);
    }

    setFilteredVehicles(filtered);
  }, [searchQuery, ownershipFilter, vehicles]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 font-medium">Loading fleet management...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-6">
      {/* Header & Controls Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fleet Vehicles</h1>
          <p className="text-sm text-gray-500">Manage and monitor agency vehicles</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Search make, model, reg #..."
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={ownershipFilter}
            onChange={(e) => setOwnershipFilter(e.target.value)}
          >
            <option value="">All Ownerships</option>
            <option value="company">Company-owned</option>
            <option value="private">Privately-owned</option>
          </select>

          <Link
            to="/add-vehicle"
            className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm text-center w-full sm:w-auto shadow-sm"
          >
            + Add Vehicle
          </Link>
        </div>
      </div>

      {/* Grid Display */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-100">
          <p className="text-gray-500 font-medium">No vehicles match your search criteria.</p>
        </div>
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
  const images = vehicle.images || [];

  const handleNext = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
      {/* Image Gallery */}
      <div {...handlers} className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[currentImageIndex]?.image}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-sm font-medium">No Images Available</div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full text-xs"
              onClick={handlePrev}
            >
              &#10094;
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full text-xs"
              onClick={handleNext}
            >
              &#10095;
            </button>
          </>
        )}

        <span className="absolute top-2 right-2 bg-gray-900/75 text-white text-xs px-2 py-1 rounded-md capitalize">
          {vehicle.ownership || "Standard"}
        </span>
      </div>

      {/* Vehicle Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-800">
              {vehicle.make} {vehicle.model}
            </h3>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {vehicle.registration_number || "N/A"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
            <div><span className="font-semibold">Color:</span> {vehicle.color}</div>
            <div><span className="font-semibold">Mileage:</span> {vehicle.mileage} km</div>
            <div><span className="font-semibold">Rate:</span> ${vehicle.price_per_day}/day</div>
            <div><span className="font-semibold">Deposit:</span> ${vehicle.deposit}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
          <Link
            to={`/fleet/vehicles/${vehicle.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-center font-medium px-3 py-2 rounded-lg text-sm transition"
          >
            View Details
          </Link>
          <Link
            to={`/edit-vehicle/${vehicle.id}`}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-center font-medium px-3 py-2 rounded-lg text-sm transition"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleList;