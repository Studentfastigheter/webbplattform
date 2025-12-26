import React from "react";
import { Quote } from "lucide-react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
}

export const Testimonial = ({ quote, author, role }: TestimonialProps) => {
  return (
    <section className="relative z-10 py-32 px-6">
      <div className="max-w-4xl mx-auto text-center relative">
        <Quote className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 text-slate-100 fill-slate-50" />
        <div className="relative z-10 space-y-10">
          <p className="text-3xl md:text-5xl font-serif text-slate-800 leading-tight">
            ”{quote}”
          </p>
          <div>
              <div className="w-16 h-1 bg-emerald-500 mx-auto mb-6 rounded-full"></div>
              <div className="font-bold text-slate-900 text-lg">{author}</div>
              <div className="text-slate-500 font-medium">{role}</div>
          </div>
        </div>
      </div>
    </section>
  );
};