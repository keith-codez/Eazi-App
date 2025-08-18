import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';


const EditableField = ({ label, name, value, onChange, isEditable, onEditToggle }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {isEditable ? (
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    ) : (
      <div className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-md">
        <span className="text-gray-700">{value || <span className="text-gray-400">Not provided</span>}</span>
        <button
          type="button"
          onClick={onEditToggle}
          className="text-blue-600 text-sm hover:underline"
        >
          Edit
        </button>
      </div>
    )}
  </div>
);

const Step3ConfirmDetails = ({ formData, bookingRequest, onChange, onSubmitRef }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [editableFields, setEditableFields] = useState({});

  const toggleEdit = (field) => {
    setEditableFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const payload = {
      national_id: formData.national_id,
      street_address: formData.street_address,
      address_line2: formData.address_line2,
      city: formData.city,
      country: formData.country,
      next_of_kin1_first_name: formData.next_of_kin1_first_name,
      next_of_kin1_last_name: formData.next_of_kin1_last_name,
      next_of_kin1_id_number: formData.next_of_kin1_id_number,
      next_of_kin1_phone: formData.next_of_kin1_phone,
      pay_now: formData.pay_now,
    };

    try {
      await axiosInstance.post(`booking-request/${bookingRequest.id}/finalize/`, payload, {
        withCredentials: true,
      });
      setSuccess(true);
      navigate(`/customer/bookings/${bookingRequest.id}/confirmation`);
    } catch (err) {
      setError('Failed to confirm booking.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = handleSubmit;
    }
  }, [onSubmitRef]);
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Step 3: Confirm Details</h2>

      {/* Contact and Address Section */}
      <div className="bg-white border p-4 rounded-xl shadow space-y-4">
        <h3 className="font-semibold text-gray-700 mb-2">Your Address</h3>
        {['national_id', 'street_address', 'address_line2', 'city', 'country'].map((field) => (
          <EditableField
            key={field}
            name={field}
            label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            value={formData[field]}
            isEditable={editableFields[field]}
            onChange={handleInputChange}
            onEditToggle={() => toggleEdit(field)}
          />
        ))}
      </div>

      {/* Next of Kin Section */}
      <div className="bg-white border p-4 rounded-xl shadow space-y-4">
        <h3 className="font-semibold text-gray-700 mb-2">Next of Kin</h3>
        {[
          'next_of_kin1_first_name',
          'next_of_kin1_last_name',
          'next_of_kin1_id_number',
          'next_of_kin1_phone'
        ].map((field) => (
          <EditableField
            key={field}
            name={field}
            label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            value={formData[field]}
            isEditable={editableFields[field]}
            onChange={handleInputChange}
            onEditToggle={() => toggleEdit(field)}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-500">Booking Confirmed!</p>}
    </div>
  );
};

export default Step3ConfirmDetails;
