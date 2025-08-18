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
    <div className="relative">
      <PublicSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
  
      <main
        className="
          w-full
          md:pl-64  // Only add left padding on medium and larger screens
          pt-16 
          md:pt-5     // To push content below the fixed top navbar on mobile
          transition-all
          duration-300
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
