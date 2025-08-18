import { useParams } from "react-router-dom";

import BookVehicleForm from "../../components/PublicCustomers/BookVehicleForm";

const BookVehiclePage = () => {
  const { vehicleId } = useParams();

  return (
    <div className="flex">
      <main className="flex-1 px-6 py-6">
        <h1 className="text-2xl font-semibold mb-6">Book Vehicle</h1>
        <BookVehicleForm vehicleId={vehicleId} />
      </main>
    </div>
  );
};

export default BookVehiclePage;
