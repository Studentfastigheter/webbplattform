"use client"; 

import React from 'react';
import { Button } from '@/components/ui/button';

export const CtaBanner = () => {
  // Din bokningslänk
  const bookingUrl = "https://outlook.office365.com/owa/calendar/UpptckCampusLyan@campuslyan.se/bookings/";

  return (
    <section className="bg-background py-12 md:py-20 px-4">
      <div className="container mx-auto max-w-6xl">
         <div className="bg-black/20 rounded-[3rem] p-10 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green-light opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10 max-w-xl">
               <h2 className="text-3xl md:text-5xl font-bold text-brand-beige-100 mb-6">Redo för Boendeplattformen? <br />Vi berättar gärna mer.</h2>
               
               {/* Knapp som öppnar i ny flik */}
               <Button 
                 variant="default" 
                 className="text-brand-beige-100 cursor-pointer" 
                 onClick={() => window.open(bookingUrl, '_blank')}
               >
                 Boka demo
               </Button>
            </div>
            
            <div className="relative z-10 w-full md:w-1/2 flex justify-center">
              <img src="https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675fd5d166f2aa68ab2e7178_Devices%20SE%20Low%20res.png" alt="Devices" className="max-w-[120%] md:max-w-full drop-shadow-2xl" />
            </div>
         </div>
      </div>
    </section>
  );
};