import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Shield, Edit3, Check, AlertCircle } from 'lucide-react';

const EditableField = ({ label, name, value, onChange, isEditable, onEditToggle, icon: Icon }) => (
  <div className="p-3 bg-white border border-slate-200 rounded-xl transition hover:border-slate-300">
    <div className="flex items-center justify-between mb-1">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        {label}
      </label>
      <button
        type="button"
        onClick={onEditToggle}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
      >
        {isEditable ? (
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <Check className="w-3 h-3" /> Save
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> Edit
          </span>
        )}
      </button>
    </div>

    {isEditable ? (
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full text-xs font-medium text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    ) : (
      <p className="text-xs font-semibold text-slate-800">
        {value || <span className="text-slate-400 italic">Not specified</span>}
      </p>
    )}
  </div>
);

const Step3ConfirmDetails = ({ formData, bookingRequest, onChange, onSubmitRef, setIsSubmitting }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [editableFields, setEditableFields] = useState({});

  const toggleEdit = (field) => {
    setEditableFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleSubmit = async () => {
    if (setIsSubmitting) setIsSubmitting(true);
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
      navigate(`/customer/bookings/${bookingRequest.id}/confirmation`);
    } catch (err) {
      console.error(err);
      setError('Failed to confirm booking request. Please check your details and try again.');
    } finally {
      if (setIsSubmitting) setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = handleSubmit;
    }
  }, [onSubmitRef, formData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 3: Review & Confirm Information</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Please confirm your personal address and emergency contact details before finalizing.
        </p>
      </div>

      {/* Address & Identification Section */}
      <div className="bg-slate-50/60 border border-slate-200/80 p-4 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Identification & Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <EditableField
            label="National ID / Passport"
            name="national_id"
            icon={Shield}
            value={formData.national_id}
            isEditable={editableFields['national_id']}
            onChange={handleInputChange}
            onEditToggle={() => toggleEdit('national_id')}
          />
          <EditableField
            label="Street Address"
            name="street_address"
            icon={MapPin}
            value={formData.street_address}
            isEditable={editableFields['street_address']}
            onChange={handleInputChange}
            onEditToggle={() => toggleEdit('street_address')}
          />
          <EditableField
            label="Address Line 2"
            name="address_line2"
            icon={MapPin}
            value={formData.address_line2}
            isEditable={editableFields['address_line2']}
            onChange={handleInputChange}
            onEditToggle={() => toggleEdit('address_line2')}
          />
          <EditableField
            label="City"
            name="city"
            icon={MapPin}
            value={formData.city}
            isEditable={editableFields['city']}
            onChange={handleInputChange}
            onEditToggle={() => toggleEdit('city')}
          />
          <EditableField
            label="Country"
            name="country"
            icon={MapPin}
            value={formData.country}
            isEditable={editableFields['country']}
            onChange={handleInputChange}
            onEditToggle={() => toggleEdit('country')}
          />
        </div>
      </div>

      {/* Emergency Contact / Next of Kin */}
      <div className="bg-slate-50/60 border border-slate-200/80 p-4 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Emergency Contact (Next of Kin)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <EditableField
            label="First Name"
            name="next_of_kin1_first_name"
            icon={User}
            value={formData.next_of_kin1_first_name}
            isEditable={editableFields['next_of_kin1_first_name']}
            onChange={handleInputChange}
            onEditToggle={() => toggleEdit('next_of_kin1_first_name')}
          />
          <EditableField
            label="Last Name"
            name="next_of_kin1_last_name"
            icon={User}
            value={formData.next_of_kin1_last_name}
            isEditable={editableFields['next_of_kin1_last_name']}
            onChange={handleInputChange}
            onEditToggle={() => toggleEdit('next_of_kin1_last_name')}
          />
          <EditableField
            label="ID Number"
            name="next_of_kin1_id_number"
            icon={Shield}
            value={formData.next_of_kin1_id_number}
            isEditable={editableFields['next_of_kin1_id_number']}
            onChange={handleInputChange}
            onEditToggle={() => toggleEdit('next_of_kin1_id_number')}
          />
          <EditableField
            label="Phone Number"
            name="next_of_kin1_phone"
            icon={Phone}
            value={formData.next_of_kin1_phone}
            isEditable={editableFields['next_of_kin1_phone']}
            onChange={handleInputChange}
            onEditToggle={() => toggleEdit('next_of_kin1_phone')}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Step3ConfirmDetails;