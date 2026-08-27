import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { 
  ArrowLeft, 
  Settings, 
  CalendarDays, 
  Wrench, 
  Info, 
  Loader2, 
  AlertTriangle,
  Tag, 
  User, 
  DollarSign, 
  CalendarClock, 
  Palette,
  Clock3
} from "lucide-react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subDays, parseISO } from "date-fns"; 

import VehicleCalendar from "../../../components/calendar/VehicleCalendar";

const VehicleDetail = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: null });

  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [unifiedOccupancy, setUnifiedOccupancy] = useState([]);

  const [maintenanceForm, setMaintenanceForm] = useState({
    service_type: "",
    cost: "",
    date: "",
    description: "",
  });

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [manualBlockReason, setManualBlockReason] = useState("");

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    fetchVehicleData();
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [id]);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: null, message: null }), 3000);
  };

  const fetchVehicleData = async () => {
    setLoading(true);
    try {
      const vRes = await axiosInstance.get(`staff-vehicles/${id}/`);
      setVehicle(vRes.data);

      const [mRes, oRes] = await Promise.all([
        axiosInstance.get(`maintenance/?vehicle=${id}`).catch(() => ({ data: [] })),
        axiosInstance.get(`staff-vehicles/${id}/occupied-dates/`).catch(() => ({ data: [] })),
      ]);

      setMaintenanceRecords(mRes.data);
      setUnifiedOccupancy(oRes.data);
    } catch (err) {
      console.error("Error loading vehicle details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceChange = (e) => {
    const { name, value } = e.target;
    setMaintenanceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      await axiosInstance.post("maintenance/", { ...maintenanceForm, vehicle: id });
      setMaintenanceForm({ service_type: "", cost: "", date: "", description: "" });
      showFeedback("success", "Service record added successfully.");
      fetchVehicleData();
    } catch (err) {
      console.log("Django Validation Errors:", err.response?.data);
      showFeedback("error", JSON.stringify(err.response?.data) || "Failed to block dates.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddManualBlock = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !manualBlockReason) return;
    setSubmitLoading(true);

    const formatDate = (date) => date.toISOString().split("T")[0];

    try {
      await axiosInstance.post("unavailability/", {
        vehicle: id,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        reason: manualBlockReason,
      });
      showFeedback("success", `Dates blocked: ${manualBlockReason}.`);
      setDateRange([null, null]);
      setManualBlockReason("");
      fetchVehicleData();
    } catch (err) {
      showFeedback("error", "Failed to block dates.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const getExcludedDateIntervals = () => {
    return unifiedOccupancy.map((range) => ({
      start: subDays(parseISO(range.start_date), 0),
      end: parseISO(range.end_date),
    }));
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-2">
        <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
        <span className="text-xs font-medium">Loading details...</span>
      </div>
    );

  if (!vehicle)
    return (
      <div className="p-4 flex flex-col items-center justify-center bg-red-50 rounded-xl border border-red-200 text-center my-4">
        <AlertTriangle className="w-8 h-8 text-red-600 mb-1" />
        <h2 className="text-base font-bold text-red-800">Vehicle not found</h2>
        <Link to="/fleet/vehicles" className="mt-2 bg-white border px-3 py-1.5 rounded text-xs text-gray-700">
          Back to Fleet
        </Link>
      </div>
    );

  return (
    <div className="w-full max-h-screen px-4 py-3 bg-gray-50 overflow-y-auto text-sm">
      {/* Top Header Bar */}
      <div className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 mb-3 flex justify-between items-center gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-0.5">
            <Link to="/fleet/vehicles" className="hover:text-blue-600 flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> Fleet
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-600 truncate max-w-[140px]">{vehicle.model}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              {vehicle.make} {vehicle.model}
            </h1>
            <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold border border-gray-200">
              {vehicle.registration_number || "N/A"}
            </span>
          </div>
        </div>
        <Link
          to={`/edit-vehicle/${vehicle.id}`}
          className="flex items-center gap-1.5 bg-gray-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-800 transition"
        >
          <Settings className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-100 mb-3 p-1 flex gap-1 w-full overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Overview", icon: Info },
          { id: "maintenance", label: "Maintenance", icon: Wrench },
          { id: "unavailability", label: "Schedule", icon: CalendarDays },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-semibold text-xs transition whitespace-nowrap ${
              activeTab === tab.id ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <div>
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
              <h2 className="font-bold text-gray-900 mb-3.5 text-base flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" /> Specs & Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                <DetailItem label="Registration" value={vehicle.registration_number} icon={Tag} isMono />
                <DetailItem label="Daily Rate" value={`$${vehicle.price_per_day}`} icon={DollarSign} />
                <DetailItem label="Manufacture Year" value={vehicle.manufacture_year} icon={CalendarClock} />
                <DetailItem label="Vehicle Color" value={vehicle.color} icon={Palette} />
                <DetailItem label="Ownership Status" value={vehicle.ownership} icon={User} capitalize />
                <DetailItem label="Current Mileage" value={`${vehicle.mileage?.toLocaleString()} km`} icon={Clock3} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-2.5 text-base">Gallery</h2>
              <div className="grid grid-cols-2 gap-2">
                {vehicle.images?.length > 0 ? (
                  vehicle.images.map((img) => (
                    <img key={img.id} src={img.image} alt="Vehicle" className="w-full h-24 object-cover rounded-lg border" />
                  ))
                ) : (
                  <div className="col-span-2 flex items-center justify-center h-24 bg-gray-50 rounded-lg border border-dashed text-gray-400 italic text-xs">
                    No Images
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <form onSubmit={handleAddMaintenance} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2.5">
              <h3 className="font-bold text-gray-900 text-base">Log Service</h3>
              {feedback.type && (
                <div className={`p-2 rounded text-xs ${feedback.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                  {feedback.message}
                </div>
              )}
              <input type="text" name="service_type" placeholder="Service Type" className="border p-2 rounded-lg bg-gray-50 text-xs" value={maintenanceForm.service_type} onChange={handleMaintenanceChange} required />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" name="cost" placeholder="Cost ($)" className="border p-2 rounded-lg bg-gray-50 text-xs" value={maintenanceForm.cost} onChange={handleMaintenanceChange} required />
                <input type="date" name="date" className="border p-2 rounded-lg bg-gray-50 text-xs" value={maintenanceForm.date} onChange={handleMaintenanceChange} required />
              </div>
              <textarea name="description" placeholder="Description..." className="border p-2 rounded-lg bg-gray-50 text-xs h-16 resize-none" value={maintenanceForm.description} onChange={handleMaintenanceChange} />
              <button type="submit" disabled={submitLoading} className="bg-gray-900 text-white rounded-lg py-2 text-xs font-semibold hover:bg-gray-800">
                Add Record
              </button>
            </form>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm md:col-span-2 p-4">
              <h3 className="font-bold text-gray-900 mb-2.5 text-base">Service History</h3>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Cost</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {maintenanceRecords.map((rec) => (
                      <tr key={rec.id}>
                        <td className="p-2.5 font-mono">{rec.date}</td>
                        <td className="p-2.5 font-semibold">{rec.service_type}</td>
                        <td className="p-2.5 text-emerald-600 font-semibold">${parseFloat(rec.cost).toFixed(2)}</td>
                        <td className="p-2.5 text-gray-500 truncate max-w-xs">{rec.description || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "unavailability" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
            <form onSubmit={handleAddManualBlock} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
              <h3 className="font-bold text-gray-900 text-base">Block Dates</h3>

              {feedback.type && (
                <div className={`p-2.5 rounded text-xs ${feedback.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                  {feedback.message}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Range</label>
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  excludeDateIntervals={getExcludedDateIntervals()}
                  minDate={new Date()}
                  placeholderText="Select start & end"
                  className="w-full border p-2 rounded-lg bg-gray-50 text-xs text-gray-900"
                  dateFormat="yyyy-MM-dd"
                  isClearable={true}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Service / Repair"
                  className="w-full border p-2 rounded-lg bg-gray-50 text-xs"
                  value={manualBlockReason}
                  onChange={(e) => setManualBlockReason(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading || !startDate || !endDate}
                className="bg-gray-900 text-white rounded-lg py-2 text-xs font-semibold hover:bg-gray-800 disabled:bg-gray-300 mt-1"
              >
                Confirm Block
              </button>
            </form>

            <div className="md:col-span-2 w-full">
              <VehicleCalendar unifiedOccupancy={unifiedOccupancy} windowWidth={windowWidth} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, icon: Icon, isMono = false, capitalize = false }) => (
  <div className="flex items-center gap-2.5">
    <div className="p-2 bg-gray-50 rounded-lg border text-gray-400 shrink-0">
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`font-bold text-gray-800 text-xs truncate ${isMono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""}`}>
        {value || "—"}
      </span>
    </div>
  </div>
);

export default VehicleDetail;