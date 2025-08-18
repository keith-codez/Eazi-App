import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Car, Users, Briefcase, Calendar, DollarSign, Settings, LogOut, ChevronDown } from "lucide-react";

const PublicSidebar = ({ onLogout, isOpen, setIsOpen }) => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const navigate = useNavigate();



  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleSubmenu = (name) =>
    setOpenSubmenus((prev) => ({ [name]: !prev[name] }));

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const menuItems = [
    
    { name: "Book a Vehicle", link: "/public-customers/book-vehicle", icon: <Car /> },
    {
      name: "Bookings",
      icon: <Calendar />,
      sub: [
        { name: "Bookings", link: "/bookings/list" },
        { name: "Booking Requests", link: "/customer/booking-requests" },
      ],
    },
    { name: "Settings", icon: <Settings />, link: "/settings" },
  ];

  return (
    <>
      {/* Top Navbar (Only Visible on Mobile) */}
      <header
        className={`fixed top-0 left-0 w-full bg-gray-900 text-white flex items-center justify-between px-5 py-3 shadow-md z-50 md:hidden ${
          isOpen ? "hidden" : "block"
        }`}
      >
        {/* Left Side: Hamburger Menu (☰) */}
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          <Menu size={24} />
        </button>

        {/* Center: EaziDrive (Hidden when sidebar opens) */}
        <h2 className="text-lg font-bold mx-auto">EaziDrive</h2>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-purple-800 text-white w-80 md:w-64 p-5 flex flex-col justify-between h-full 
        transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:block z-50`}
      >
        {/* Sidebar Header (Only shows close button on mobile) */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">EaziDrive</h2>
          {/* Show close button only on mobile */}
          <button
            onClick={toggleSidebar}
            className="text-white focus:outline-none md:hidden"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Menu */}
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2">
              {item.sub ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-700 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transform transition-transform ${
                        openSubmenus[item.name] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openSubmenus[item.name] && (
                    <ul className="ml-6 mt-2 space-y-1">
                      {item.sub.map((subItem) => (
                        <li key={subItem.link}>
                          <Link
                            to={subItem.link}
                            className="block px-4 py-1 text-gray-300 hover:bg-gray-700 rounded"
                            onClick={toggleSidebar}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={item.link}
                  className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-700 rounded"
                  onClick={toggleSidebar}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 w-full text-left p-2 bg-red-600 hover:bg-red-700 rounded mt-4"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
};

export default PublicSidebar;
