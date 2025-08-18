import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") {
      setUsername(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = await login(username, password); // ⬅️ direct call

      const role = user.role;
      if (role === "customer") {
        navigate("/customer/dashboard");
      } else if (role === "agent" || role === "agency") {
        navigate("/staff/dashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error("Login error:", error);
      setMessage("Login failed. Please check your username and password.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-full px-4 bg-gray-100">
      <form className="w-96 p-6 bg-white rounded shadow-lg" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input
          type="text"
          name="username"
          placeholder="Username or Email"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          onChange={handleChange}
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700" type="submit">
          Login
        </button>
        <p className="mt-2 text-red-500">{message}</p>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/register-customer" className="text-blue-600 hover:underline">Sign Up</Link>
        </p>
        <p className="mt-4 text-center">
          Forgot Password?{" "}
          <Link to="/request/password_reset" className="text-blue-600 hover:underline">Reset Password</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
