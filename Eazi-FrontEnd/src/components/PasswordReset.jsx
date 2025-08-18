import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/api";

const PasswordReset = () => {
    const { token } = useParams(); // Get token from URL params
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            await resetPassword(token, formData.password);
            setMessage("Your password has been reset successfully.");
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000); // Redirect after 3s
        } catch (error) {
            setMessage(error.response?.data.error || "Password reset failed.");
            setSuccess(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form className="w-96 p-6 bg-white rounded shadow-lg" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-4">Reset Your Password</h2>

                {token ? (
                    <>
                        <input
                            type="password"
                            name="password"
                            placeholder="New Password"
                            className="w-full p-2 mb-2 border border-gray-300 rounded"
                            onChange={handleChange}
                        />

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm New Password"
                            className="w-full p-2 mb-2 border border-gray-300 rounded"
                            onChange={handleChange}
                        />

                        <button
                            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                            type="submit"
                            disabled={success}
                        >
                            Reset Password
                        </button>
                    </>
                ) : (
                    <p className="text-red-500">Invalid or missing reset token.</p>
                )}

                <p className={`mt-2 ${success ? "text-green-500" : "text-red-500"}`}>{message}</p>
            </form>
        </div>
    );
};

export default PasswordReset;
