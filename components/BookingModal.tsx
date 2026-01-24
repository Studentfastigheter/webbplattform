"use client";

import { useState, useEffect, MouseEvent } from "react";

export default function BookingModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const bookingUrl = "https://outlook.office365.com/owa/calendar/UpptckCampusLyan@campuslyan.se/bookings/";

  // Hantera body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Funktion för att stoppa klick från att bubbla upp till overlay
  const handleModalClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Trigger-knapp */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-transform hover:scale-105"
      >
        Boka demo
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-4xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={handleModalClick}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-700">Boka intro med CampusLyan</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Stäng modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 w-full bg-white relative">
              <iframe
                src={bookingUrl}
                className="absolute inset-0 w-full h-full border-0"
                title="Boka tid via Microsoft Bookings"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}