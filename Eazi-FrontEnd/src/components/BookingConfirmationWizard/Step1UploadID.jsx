import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

// Replace with your backend base URL
const BASE_URL = "http://localhost:8000"; // or https://yourdomain.com

function getFullURL(path) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BASE_URL}${path}`;
}

const Step1UploadID = ({ onNext, onChange, formData, setIsStepValid }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (formData.drivers_license) {
      setImagePreview(getFullURL(formData.drivers_license));
    }
  }, [formData.drivers_license]);

  useEffect(() => {
    setIsStepValid(!!formData.drivers_license);
  }, [formData.drivers_license, setIsStepValid]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("drivers_license", file);

    setUploading(true);
    setError(null);

    try {
      const response = await axiosInstance.patch("customers/me/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = getFullURL(response.data?.drivers_license) || URL.createObjectURL(file);

      setImagePreview(fileUrl);
      onChange("drivers_license", fileUrl);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
      setIsStepValid(false);
    } finally {
      setUploading(false);
    }
  };

  const handleReplaceClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Step 1: Upload Driver's License</h2>
        <p className="text-sm text-gray-500 mb-4">
          Please upload a clear image or PDF of your valid driver's license.
        </p>
      </div>

      {imagePreview ? (
        <div className="space-y-4">
          <p className="text-sm text-green-700">✅ License uploaded</p>
          {imagePreview.toLowerCase().endsWith('.pdf') ? (
            <a href={imagePreview} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              📄 View uploaded PDF
            </a>
          ) : (
            <img
              src={imagePreview}
              alt="Driver's License"
              className="w-48 rounded shadow"
              onError={() => setImagePreview(null)}
            />
          )}

          <button
            onClick={handleReplaceClick}
            className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 transition"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Replace License
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-700 transition">
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload File
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}

      {uploading && <p className="text-sm text-blue-500">Uploading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Step1UploadID;
