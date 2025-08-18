import React, { useState } from "react";
import { requestPasswordReset } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

const PasswordResetRequest = () => {
    const [formData, setFormData] = useState({ email: "" });
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await requestPasswordReset(formData.email);
            setMessage("A password reset link has been sent to your email.");
            setSuccess(true);
        } catch (error) {
            setMessage(error.response?.data.error || "Password reset request failed.");
            setSuccess(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form className="w-96 p-6 bg-white rounded shadow-lg" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-4">Request Password Reset</h2>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
                  onChange={handleChange}
                  value={formData.email}
                  required
                />
                <button 
                  className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700" 
                  type="submit"
                  disabled={success}
                >
                  Request Password Reset
                </button>
                <p className={`mt-2 ${success ? "text-green-500" : "text-red-500"}`}>{message}</p>
                <p className="mt-4 text-center">
                    Remember your password?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </form>
        </div>
    );
}

export default PasswordResetRequest;
