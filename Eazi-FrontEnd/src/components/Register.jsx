import React, { useState } from "react";
import { registerManager } from "../api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerManager(
        formData.username,
        formData.first_name,
        formData.middle_name,
        formData.last_name,
        formData.email,
        formData.password
      );
      setMessage("User registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(error.response?.data.error || "Registration failed.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form className="w-96 p-6 bg-white rounded shadow-lg" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="middle_name"
          placeholder="Middle Name (Optional)"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          onChange={handleChange}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          onChange={handleChange}
          required
        />
        
        <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700" type="submit">
          Sign Up
        </button>
        
        <p className="mt-2 text-red-500">{message}</p>
        
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
