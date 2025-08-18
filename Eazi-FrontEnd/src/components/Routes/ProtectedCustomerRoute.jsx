import React, { useContext, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import CustomerSidebar from "../CustomerSidebar";
import { AuthContext } from "../../contexts/AuthContext";

const ProtectedCustomerRoute = () => {
  const { user, role, logout, loading } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Wait for auth check to complete
  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  // Allow only logged-in users with role === "customer"
  const isAllowed = user && role === "customer";

  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex w-full min-h-screen overflow-x-hidden">
      <CustomerSidebar
        onLogout={logout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-grow p-4 w-full transition-all duration-300 md:ml-64 pt-16 md:pt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedCustomerRoute;
