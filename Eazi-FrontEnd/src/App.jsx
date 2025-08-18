import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


import Login from "./components/Login";
import CustomerRegister from "./components/CustomerRegister";
import PasswordResetRequest from "./components/PasswordResetRequest";
import PasswordReset from "./components/PasswordReset";
import ProtectedCustomerRoute from "./components/Routes/ProtectedCustomerRoute";
import ProtectedStaffRoute from "./components/Routes/ProtectedStaffRoute";
import PublicRoute from "./components/Routes/PublicRoute";

import {
  // Agent Pages
  Dashboard,
  VehicleList,
  AddVehicle,
  EditVehicle,
  MaintenanceRecords,
  Unavailability,
  CustomerList,
  AddCustomer,
  EditCustomer,
  CustomerDetails,
  CustomerAnalytics,
  SupplierList,
  BookingList,
  AddBooking,
  BookingRequests,
  BookingHistory,
  BookingRequestDetail,
  Payments,
  Invoices,
  Settings,

  // Customer Pages
  CustomerLandingPage,
  BookingRequestPage,
  CustomerDashboard,
  CustomerVehicleBrowserPage,
  CustomerBookingRequestsPage,
  BookVehiclePage,
  ConfirmBooking,
  BookingConfirmationPage,
} from "./pages";





import { useContext, useEffect } from "react";
import { AuthContext } from "./contexts/AuthContext";



import axiosInstance from "./api/axiosInstance.js";



function App() {

  const { token, role, logout } = useContext(AuthContext);

  useEffect(() => {
  axiosInstance.get("csrf/")
    .then(() => console.log("✅ CSRF cookie set"))
    .catch((err) => console.error("Failed to get CSRF token", err));
}, []);

  return (
    <Router>
      <div className="flex w-full min-h-screen overflow-x-hidden">
        <div className="flex-grow w-full transition-all duration-300">
          <Routes>
            {/* Public Routes */}
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<CustomerLandingPage />} />
              <Route path="/book-now/:vehicleId" element={<BookingRequestPage />} />
              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register-customer" element={<CustomerRegister />} />
              <Route path="/request/password_reset" element={<PasswordResetRequest />} />
              <Route path="/password-reset/:token" element={<PasswordReset />} />

              {/* any other public pages */}
            </Route>
        
            {/* Protected Customer Routes */}
            <Route element={<ProtectedCustomerRoute />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/public-customers/book-vehicle" element={<CustomerVehicleBrowserPage />} />
              <Route path="/public-customers/book-vehicle/:vehicleId" element={<BookVehiclePage />} />
              <Route path="/customer/booking-requests" element={<CustomerBookingRequestsPage />} />
              <Route path="/customer/booking-requests/:requestId/confirm" element={<ConfirmBooking />} />
              <Route path="/customer/bookings/:id/confirmation" element={<BookingConfirmationPage />} />
            </Route>

            {/* Protected Staff Routes */}
            <Route element={<ProtectedStaffRoute />}>
              <Route path="/staff/dashboard" element={<Dashboard />} />
              <Route path="/fleet/vehicles" element={<VehicleList />} />
              <Route path="/add-vehicle" element={<AddVehicle />} />
              <Route path="/edit-vehicle/:id" element={<EditVehicle />} />
              <Route path="/fleet/maintenance" element={<MaintenanceRecords />} />
              <Route path="/fleet/unavailability" element={<Unavailability />} />
              <Route path="/customers/list" element={<CustomerList />} />
              <Route path="/customers/analytics" element={<CustomerAnalytics />} />
              <Route path="/details/:id" element={<CustomerDetails />} />
              <Route path="/add-customer" element={<AddCustomer />} />
              <Route path="/edit-customer/:id" element={<EditCustomer />} />
              <Route path="/suppliers/list" element={<SupplierList />} />
              <Route path="/bookings/list" element={<BookingList />} />
              <Route path="/add-booking" element={<AddBooking />} />
              <Route path="/bookings/requests" element={<BookingRequests />} />
               <Route path="/booking-requests/:id" element={<BookingRequestDetail />} />
              <Route path="/bookings/history" element={<BookingHistory />} />
              <Route path="/finances/payments" element={<Payments />} />
              <Route path="/finances/invoices" element={<Invoices />} />
              <Route path="/settings" element={<Settings />} />
            </Route>


            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
