import { useParams, useNavigate } from "react-router-dom";
import BookVehicleForm from "../../components/PublicCustomers/BookVehicleForm";

const BookVehiclePage = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors mb-2"
            >
              ← Back to Fleet
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Reserve Your Vehicle
            </h1>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Instant Request
          </span>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <BookVehicleForm vehicleId={vehicleId} />
        </div>
      </div>
    </div>
  );
};

export default BookVehiclePage;