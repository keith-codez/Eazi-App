import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subDays, parseISO } from "date-fns";
import "./calendar.css";

const VehicleCalendar = ({ unifiedOccupancy = [], windowWidth }) => {
  const getExcludedDateIntervals = () => {
    return unifiedOccupancy.map((range) => ({
      start: subDays(parseISO(range.start_date), 0),
      end: parseISO(range.end_date),
    }));
  };

  const getDayClassName = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const match = unifiedOccupancy.find(
      (r) => dateStr >= r.start_date && dateStr <= r.end_date
    );

    if (match) {
      if (match.type === "system_booking") return "booked-blue-blur";
      if (match.type === "manual_block") return "blocked-rose-blur";
    }
    return undefined;
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full flex flex-col gap-3">
      {/* Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Occupancy Schedule</h3>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-300"></span>
            <span className="text-gray-600">Rental</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-300"></span>
            <span className="text-gray-600">Blocked</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="calendar-container border border-gray-100 rounded-lg p-2 bg-gray-50/50 flex justify-center w-full overflow-hidden">
        <DatePicker
          inline
          monthsShown={windowWidth < 1280 ? 1 : 2}
          excludeDateIntervals={getExcludedDateIntervals()}
          dayClassName={getDayClassName}
          minDate={new Date()}
        />
      </div>

      {/* Range Breakdown Scroll List */}
      <div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
          Active Ranges ({unifiedOccupancy.length})
        </span>

        {unifiedOccupancy.length === 0 ? (
          <p className="text-xs text-gray-400 italic bg-gray-50 p-2.5 rounded-md text-center">
            No active bookings or manual blocks.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {unifiedOccupancy.map((item, idx) => (
              <div
                key={idx}
                className={`px-2.5 py-1.5 rounded-md border flex items-center justify-between gap-2 text-xs ${
                  item.type === "system_booking"
                    ? "bg-sky-50/70 border-sky-100 text-sky-900"
                    : "bg-rose-50/70 border-rose-100 text-rose-900"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      item.type === "system_booking" ? "bg-sky-500" : "bg-rose-500"
                    }`}
                  ></span>
                  <span className="font-semibold truncate">
                    {item.reason || item.title || "Occupied"}
                  </span>
                </div>
                <span className="font-mono text-[11px] font-medium bg-white/90 px-2 py-0.5 rounded border border-black/5 whitespace-nowrap shrink-0">
                  {item.start_date} → {item.end_date}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCalendar;