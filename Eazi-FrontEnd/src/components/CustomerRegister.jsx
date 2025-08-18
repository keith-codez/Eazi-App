import React, { useState } from "react";
import { registerCustomer } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

function CustomerRegister () {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    phone_number: "",
    first_name: "",
    last_name: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerCustomer(
        formData.email,
        formData.username,
        formData.phone_number,
        formData.first_name,
        formData.last_name,
        formData.password
      );
      setMessage("User registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(error.response?.data.error || "Registration failed.");
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="w-96 p-6 bg-white rounded shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          onChange={handleChange}
          required
        />
        <input
          type="username"
          name="username"
          placeholder="Username"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          onChange={handleChange}
          required
        />
        <input
          type="phone_number"
          name="phone_number"
          placeholder="Phone Number"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          onChange={handleChange}
          required
        />
        <input
          type="first_name"
          name="first_name"
          placeholder="First Name"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          onChange={handleChange}
          required
        />
        <input
          type="last_name"
          name="last_name"
          placeholder="Last Name"
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
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700" >
          Register
        </button>

        <p className="mt-2 text-red-500">{message}</p>
        
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default CustomerRegister;