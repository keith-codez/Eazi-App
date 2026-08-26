import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  FileText, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  Maximize2, 
  X 
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const BASE_URL = "http://localhost:8000";

function getFullURL(path) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BASE_URL}${path}`;
}

const Step1UploadID = ({ onChange, formData, setIsStepValid }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (formData.drivers_license) {
      setImagePreview(getFullURL(formData.drivers_license));
    }
  }, [formData.drivers_license]);

  useEffect(() => {
    setIsStepValid(!!formData.drivers_license);
  }, [formData.drivers_license, setIsStepValid]);

  const uploadFile = async (file) => {
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
      setError("Upload failed. Please try a valid image or PDF.");
      setIsStepValid(false);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    uploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const isPdf = imagePreview?.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 1: Driver's License Verification</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload a legible copy of your valid driver's license (JPEG, PNG, or PDF).
        </p>
      </div>

      {imagePreview ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 rounded-xl text-emerald-800 text-xs font-medium">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Document attached and ready for verification
            </span>
          </div>

          {/* Expanded Clear Preview Box */}
          <div className="relative group bg-slate-900/5 border border-slate-200 rounded-xl overflow-hidden min-h-[220px] sm:min-h-[280px] flex items-center justify-center p-3">
            {isPdf ? (
              <div className="flex flex-col items-center justify-center text-slate-600 gap-2 p-6 text-center">
                <FileText className="w-12 h-12 text-blue-600" />
                <span className="text-xs font-bold">PDF Document Uploaded</span>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Your PDF license file has been attached successfully.
                </p>
              </div>
            ) : (
              <>
                <img
                  src={imagePreview}
                  alt="Driver's License Preview"
                  className="w-full max-h-[320px] object-contain rounded-lg drop-shadow-sm transition-transform duration-200"
                  onError={() => setImagePreview(null)}
                />
                
                {/* Fullscreen Expand Action Button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="absolute top-3 right-3 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-lg text-xs font-medium backdrop-blur-xs transition opacity-90 sm:opacity-0 sm:group-hover:opacity-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
              </>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="text-center sm:text-left">
              <h4 className="text-xs font-semibold text-slate-800">Verify Legibility</h4>
              <p className="text-[11px] text-slate-400">
                Ensure all text, photo, and dates on the license are clearly visible.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition cursor-pointer shrink-0"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Replace Document
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Click to upload or drag and drop
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports JPEG, PNG, or PDF up to 10MB
            </p>
          </div>
          <button
            type="button"
            disabled={uploading}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 shadow-2xs transition"
          >
            Select Document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lightbox Modal for High-Resolution Inspection */}
      {isModalOpen && !isPdf && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl p-2 shadow-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-2 flex items-center justify-center max-h-[80vh]">
              <img
                src={imagePreview}
                alt="Driver's License Full View"
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1UploadID;