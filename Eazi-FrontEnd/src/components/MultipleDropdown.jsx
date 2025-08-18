import { useState, useRef, useEffect } from "react";

const MultiSelectDropdown = ({ options, selected, setSelected }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelection = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-gray-700 font-medium mb-1">Pickup Locations</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <span>
          {selected.length === 0
            ? "Select locations..."
            : `${selected.length} location(s) selected`}
        </span>
        <svg
          className={`w-4 h-4 transform transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          {options.map((location) => (
            <label
              key={location.id}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                className="mr-2"
                checked={selected.includes(location.id)}
                onChange={() => toggleSelection(location.id)}
              />
              {location.name} – {location.city}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};


export default MultiSelectDropdown;
