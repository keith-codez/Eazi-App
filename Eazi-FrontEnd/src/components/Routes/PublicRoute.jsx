// src/routes/PublicRoute.jsx

import React, { useState, useContext } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import PublicSidebar from "../PublicSidebar";

const PublicRoute = () => {
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (role === "staff" || role === "agent" || role === "agency") {
    return <Navigate to="/staff/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen w-full bg-gray-50">
      <PublicSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
  
      <main
        className="
          w-full
          md:pl-64
          pt-16
          md:pt-5
          transition-all
          duration-300
          min-h-screen
        "
      >
        <div className="w-full px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PublicRoute;