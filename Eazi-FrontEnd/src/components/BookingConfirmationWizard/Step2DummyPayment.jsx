import React from 'react';

const Step2DummyPayment = ({ onChange, formData }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Payment Step</h2>

      <label className="block mb-2">
        <input
          type="radio"
          name="payment"
          value="true"
          checked={formData.pay_now === true}
          onChange={() => onChange('pay_now', true)}
        />{' '}
        Pay deposit to secure your vehicle
      </label>
    </div>
  );
};

export default Step2DummyPayment;
