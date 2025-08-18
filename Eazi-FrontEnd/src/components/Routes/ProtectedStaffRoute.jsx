import React, { useContext, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import { AuthContext } from "../../contexts/AuthContext";

const ProtectedStaffRoute = () => {
  const { user, role, logout, loading } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Guard: wait until loading is complete
  if (loading) {
  return <div className="text-center mt-10">Loading...</div>;
}

  // Guard: not logged in or incorrect role
  const isAllowed = user && (role === "staff" || role === "agent" || role === "agency");

  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex w-full min-h-screen overflow-x-hidden">
      <Sidebar
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

export default ProtectedStaffRoute;
