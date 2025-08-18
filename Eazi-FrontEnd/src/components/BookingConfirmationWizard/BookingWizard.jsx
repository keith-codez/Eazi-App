import React, { useState,  useRef } from 'react';
import Step1UploadID from './Step1UploadID';
import Step2DummyPayment from './Step2DummyPayment';
import Step3ConfirmDetails from './Step3ConfirmDetails';

const BookingWizard = ({ bookingRequest }) => {
  const [step, setStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
 

  const [formData, setFormData] = useState({
    drivers_license: bookingRequest?.customer?.drivers_license || '',
    pay_now: true,
    national_id: bookingRequest?.customer?.national_id || '',
    street_address: bookingRequest?.customer?.street_address || '',
    address_line2: bookingRequest?.customer?.address_line2 || '',
    city: bookingRequest?.customer?.city || '',
    country: bookingRequest?.customer?.country || '',
    next_of_kin1_first_name: bookingRequest?.customer?.next_of_kin1_first_name || '',
    next_of_kin1_last_name: bookingRequest?.customer?.next_of_kin1_last_name || '',
    next_of_kin1_id_number: bookingRequest?.customer?.next_of_kin1_id_number || '',
    next_of_kin1_phone: bookingRequest?.customer?.next_of_kin1_phone || ''
  });

  const submitStep3Ref = useRef(); 

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderStep = () => {
    switch (step) {
        case 1:
        return <Step1UploadID onNext={handleNext} onChange={handleChange} formData={formData} setIsStepValid={setIsStepValid} />;
        case 2:
        return <Step2DummyPayment onNext={handleNext} onBack={handleBack} onChange={handleChange} formData={formData} setIsStepValid={setIsStepValid} />;
        case 3:
        return <Step3ConfirmDetails onBack={handleBack} onChange={handleChange} formData={formData} bookingRequest={bookingRequest}  onSubmitRef={submitStep3Ref} />;
        default:
        return null;
    }
};

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 shadow-xl rounded-xl bg-white space-y-6">
      <ProgressIndicator step={step} />
      <VehicleSummary vehicle={bookingRequest.vehicle} />
      <p className="text-sm text-gray-500 mb-4">
        Rental Dates: {bookingRequest.start_date} → {bookingRequest.end_date}
      </p>

      {renderStep()}

      {/* GLOBAL NAVIGATION BUTTONS */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
        {step > 1 ? (
            <button
            onClick={handleBack}
            className="inline-flex items-center justify-center px-5 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-all"
            >
            Back
            </button>
        ) : <div />}

        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid}
            className={`inline-flex items-center justify-center px-5 py-2 rounded-xl ${
              isStepValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-all`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => submitStep3Ref.current && submitStep3Ref.current()}
            className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-all"
          >
            Confirm Booking
          </button>
        )}
        </div>
    </div>
  );
};

const ProgressIndicator = ({ step }) => {
  const steps = ['Upload ID', 'Make Payment', 'Confirm Details'];
  return (
    <div className="flex justify-between mb-6">
      {steps.map((label, index) => (
        <div
          key={index}
          className={`flex-1 text-center ${
            index + 1 <= step ? 'font-bold text-blue-600' : 'text-gray-400'
          }`}
        >
          {index + 1}. {label}
        </div>
      ))}
    </div>
  );
};

const VehicleSummary = ({ vehicle }) => {
  if (!vehicle) return null;

  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
      <img
        src={vehicle.main_image || vehicle.image}
        alt={`${vehicle.make} ${vehicle.model}`}
        className="w-full h-48 object-cover rounded"
      />
      <div className="mt-3">
        <h2 className="text-lg font-semibold text-gray-800">
          {vehicle.make} {vehicle.model}
        </h2>
        <p className="text-sm text-gray-600">£{vehicle.price_per_day}/day</p>
      </div>
    </div>
  );
};

export default BookingWizard;
