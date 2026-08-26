import React, { useState, useRef } from 'react';
import Step1UploadID from './Step1UploadID';
import Step2DummyPayment from './Step2DummyPayment';
import Step3ConfirmDetails from './Step3ConfirmDetails';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Loader2,
  FileCheck2,
  CreditCard,
  UserCheck
} from 'lucide-react';

const BookingWizard = ({ bookingRequest }) => {
  const [step, setStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        return (
          <Step1UploadID 
            onNext={handleNext} 
            onChange={handleChange} 
            formData={formData} 
            setIsStepValid={setIsStepValid} 
          />
        );
      case 2:
        return (
          <Step2DummyPayment 
            onNext={handleNext} 
            onBack={handleBack} 
            onChange={handleChange} 
            formData={formData} 
            setIsStepValid={setIsStepValid} 
            bookingRequest={bookingRequest}
          />
        );
      case 3:
        return (
          <Step3ConfirmDetails 
            onBack={handleBack} 
            onChange={handleChange} 
            formData={formData} 
            bookingRequest={bookingRequest} 
            onSubmitRef={submitStep3Ref} 
            setIsSubmitting={setIsSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Step Progress Stepper */}
      <ProgressIndicator currentStep={step} setStep={setStep} />

      {/* Vehicle Summary Banner */}
      <VehicleSummary vehicle={bookingRequest?.vehicle} bookingRequest={bookingRequest} />

      {/* Dynamic Step Content */}
      <div className="py-2">
        {renderStep()}
      </div>

      {/* Footer Navigation Bar */}
      <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm active:scale-[0.98] cursor-pointer ${
              isStepValid 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitStep3Ref.current && submitStep3Ref.current()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm active:scale-[0.98] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Booking...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm & Complete Booking</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Progress Indicator Component ---
const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Identity Verification', icon: FileCheck2 },
    { number: 2, label: 'Deposit & Payment', icon: CreditCard },
    { number: 3, label: 'Final Confirmation', icon: UserCheck },
  ];

  return (
    <div className="w-full pb-4 border-b border-slate-100">
      <div className="flex items-center justify-between max-w-xl mx-auto relative">
        {/* Connector Line Background */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        
        {/* Active Line Fill */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((s) => {
          const isCompleted = s.number < currentStep;
          const isActive = s.number === currentStep;

          return (
            <div key={s.number} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-2">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border ${
                  isCompleted
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : isActive
                    ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : s.number}
              </div>
              <span className={`text-[11px] font-medium hidden sm:block ${
                isActive ? 'text-slate-900 font-semibold' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Vehicle Summary Card ---
const VehicleSummary = ({ vehicle, bookingRequest }) => {
  if (!vehicle) return null;

  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <img
          src={vehicle.main_image || vehicle.image}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-20 h-20 sm:w-24 sm:h-20 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
        />
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-md text-[10px] font-semibold text-blue-700 uppercase tracking-wide">
            Selected Vehicle
          </div>
          <h2 className="text-base font-bold text-slate-900 leading-snug">
            {vehicle.make} {vehicle.model}
          </h2>
          <p className="text-xs text-slate-500">
            Rate: <span className="font-semibold text-slate-800">${vehicle.price_per_day}/day</span>
            <span className="mx-1.5 text-slate-300">•</span>
            Deposit: <span className="font-semibold text-slate-800">${vehicle.deposit}</span>
          </p>
        </div>
      </div>

      {/* Date Pill */}
      {bookingRequest && (
        <div className="w-full sm:w-auto flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 text-xs text-slate-600 shadow-2xs">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span>{bookingRequest.start_date}</span>
            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{bookingRequest.end_date}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingWizard;