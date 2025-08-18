import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MoreVertical } from "lucide-react";




export default function BookingCarousel({
  bookings, 
  openDropdownId,
  toggleDropdown,
  handleViewBooking,
  handleEditBooking,
  handleCreateInvoice
 }) {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemRefs = useRef([]);



  // Watch which item is in view using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index"));
            setCurrentIndex(index);
          }
        });
      },
      {
        root: carouselRef.current,
        threshold: 0.6, // 60% in view = active
      }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [bookings]);

  const scrollToIndex = (index) => {
    const node = itemRefs.current[index];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", inline: "center" });
      setCurrentIndex(index);
    }
  };

  const scrollLeft = () => scrollToIndex(Math.max(currentIndex - 1, 0));
  const scrollRight = () => scrollToIndex(Math.min(currentIndex + 1, bookings.length - 1));

  return (
    <div className="relative block md:hidden w-full overflow-hidden my-3 pt-10 pb-6">
      {bookings.length > 0 ? (
        <>
          {/* Arrow Buttons */}
          <div className="flex justify-between items-center w-full absolute top-0 z-10">
            <button
              onClick={scrollLeft}
              className="bg-white mx-5 shadow-md p-3 rounded-sm hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              className="bg-white mx-5 shadow-md p-3 rounded-sm hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex space-x-4 my-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar w-full"
          >
            {bookings.map((booking, index) => (
              <div
                key={booking.id}
                ref={(el) => (itemRefs.current[index] = el)}
                data-index={index}
                className="w-full snap-start shrink-0"
              >
                <div className="bg-white shadow-lg mb-2 rounded-lg">

                  {/* 3-dot button */}
                  <div className="flex justify-end items-center px-3 pt-3">
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(booking.id)}
                        className="text-gray-500 hover:text-black p-1"
                      >
                        <MoreVertical className="w-7 h-7 text-blue-600 rotate-90 hover:text-blue-400 cursor-pointer" /> {/* rotate to make it horizontal */}
                      </button>

                      {openDropdownId === booking.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-20">
                          <button
                            onClick={() => handleCreateInvoice(booking.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Create Invoice
                          </button>
                          <button
                            onClick={() => handleViewBooking(booking.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            View Booking
                          </button>
                          <button
                            onClick={() => handleEditBooking(booking.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Edit Booking
                          </button>
                        </div>
                      )}
                    </div>
                  </div>


                  <div className="my-4 p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Booking ID</span>
                      <span className="text-gray-700">#{booking.id}</span>
                    </div>
                    <div className="border-t border-gray-200" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Date</span>
                      <span className="text-gray-700">{booking.booking_}</span>
                    </div>
                    <div className="border-t border-gray-200" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Amount</span>
                      <span className="text-gray-700">${booking.booking_amount}</span>
                    </div>
                    <div className="border-t border-gray-200" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Status</span>
                      <span
                        className={`px-2 py-1 rounded-lg text-white text-sm ${
                          booking.booking_status === "Completed"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {booking.booking_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-5 space-x-2">
            {bookings.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-blue-500 scale-125" : "bg-gray-300"
                }`}
              ></button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">No bookings found.</p>
      )}
    </div>
  );
}
