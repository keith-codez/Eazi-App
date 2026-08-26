import React, { useEffect } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

const Step2DummyPayment = ({ onChange, formData, setIsStepValid, bookingRequest }) => {
  useEffect(() => {
    setIsStepValid(true);
  }, [setIsStepValid]);

  const deposit = bookingRequest?.vehicle?.deposit || "0.00";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 2: Security Deposit & Payment</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select your preferred payment method to secure your vehicle allocation.
        </p>
      </div>

      {/* Payment Selection Card */}
      <div 
        onClick={() => onChange('pay_now', true)}
        className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
          formData.pay_now
            ? 'border-blue-600 bg-blue-50/20 shadow-xs'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <div className="mt-0.5">
          <input
            type="radio"
            name="payment"
            value="true"
            checked={formData.pay_now === true}
            onChange={() => onChange('pay_now', true)}
            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900">
                Pay Refundable Security Deposit
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-900">${deposit}</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Reserves vehicle instantly. Your security deposit will be refunded in full upon successful vehicle return inspection.
          </p>
        </div>
      </div>

      {/* Payment Summary Box */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Payment Overview
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Vehicle Security Deposit</span>
            <span className="font-semibold text-slate-900">${deposit}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Processing Fee</span>
            <span className="font-semibold text-emerald-600">FREE</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
            <span>Total Payable Now</span>
            <span className="text-blue-600">${deposit}</span>
          </div>
        </div>
      </div>

      {/* Security Guarantee */}
      <div className="flex items-center gap-2.5 text-[11px] text-slate-500 bg-slate-100/70 p-3 rounded-xl border border-slate-200/50">
        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
        <span>256-bit encrypted secure transaction. No payment details are stored locally.</span>
      </div>
    </div>
  );
};

export default Step2DummyPayment;