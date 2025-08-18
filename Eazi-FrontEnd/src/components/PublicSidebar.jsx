// src/components/PublicSidebar.jsx

import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogIn, Phone, Car, Users, UserPlus, Handshake } from "lucide-react";

const menuItems = [
  { name: "Available Vehicles", link: "/", icon: <Car /> },
  { name: "About Us", link: "/about", icon: <Users /> },
  { name: "Contact", link: "/contact", icon: <Phone /> },
  { name: "Become an Partner", link: "/agent-signup", icon: <Handshake /> },
   { name: "Register your Agency", link: "/agent-signup", icon: <Handshake /> },
  { name: "Register", link: "/register-customer", icon: <UserPlus /> },
];

const PublicSidebar = ({ isOpen, setIsOpen, onLogout }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const handleLogin = () => {
    navigate("/login");
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);


  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-[#10451D] text-white flex items-center justify-between px-4 py-3 z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold">EaziDrive</h1>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-[#10451D] text-white font-medium w-64 z-40 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:block
          pt-20 md:pt-5 px-5`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-xl font-bold">EaziDrive</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-4 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.link}
              className="flex items-center space-x-3 px-2 py-2 rounded hover:bg-[#208B3A] transition"
              onClick={() => setIsOpen(false)} // close on mobile
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-10">
        <button
          onClick={() => {
            setIsOpen(false);
            handleLogin();
          }}
          className="flex items-center space-x-3 w-full text-left text-black font-semibold bg-[#92E6A7] hover:text-white hover:bg-[#208B3A] px-3 py-2 rounded"
        >
            <LogIn size={20} />
            <span>Login</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default PublicSidebar;
