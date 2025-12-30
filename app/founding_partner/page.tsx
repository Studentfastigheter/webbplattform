"use client";

import React, { useState, FormEvent } from "react";
import { 
  ArrowRight, X, ShieldCheck, CheckCircle2, Building, Plus, 
  TrendingUp, Fingerprint, Crown, Lock
} from "lucide-react";

// --- DATA ---
const PARTNER_SLOTS = [
  { 
    id: 1, 
    status: "filled", 
    category: "Housing System",
    name: "SGS Studentbostäder", 
    description: "Marknadsledande aktör som sätter standarden för moderna studenthem och digital förvaltning.",
    logoType: "sgs",
  }, 
  { 
    id: 2, 
    status: "negotiating", 
    category: "Banking Services",
    name: "Under Sekretess",
    description: "En nationell storbank som utvecklar nästa generations betallösningar för hyresmarknaden.",
    logoType: "secret",
  },
  { 
    id: 3, 
    status: "available", 
    category: "Insurance",
    name: "Ledig plats", 
    description: "Sökes: Försäkringsbolag som vill integrera hemförsäkring direkt i signeringflödet.",
    logoType: "available",
  },
  { 
    id: 4, 
    status: "available", 
    category: "Retail / Food",
    name: "Ledig plats", 
    description: "Sökes: Aktör inom dagligvaruhandel eller matkassar för studentsegmentet.",
    logoType: "available",
  },
  { 
    id: 5, 
    status: "available", 
    category: "Energy / Broadband",
    name: "Ledig plats", 
    description: "Sökes: Energibolag eller bredbandsleverantör för paketerade starterbjudanden.",
    logoType: "available",
  },
];

// --- MODAL FORM ---
function ApplicationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      company: formData.get("company"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
    };
    const subject = `Ansökan Founding Partner - ${data.company}`;
    const body = `Hej Alvin,\n\nVi vill gärna ansöka om att bli en av era Founding Partners.\n\nFöretag: ${data.company}\nKontaktperson: ${data.name}\nTelefon: ${data.phone}\nEmail: ${data.email}\n\nMotivering:\n${data.message}`;
    window.location.href = `mailto:alvin.stallgard@campuslyan.se?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTimeout(onClose, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Ansökan Founding Partner</h3>
            <p className="text-xs text-slate-500 mt-0.5">Icke bindande intresseanmälan</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Företag</label>
            <input required name="company" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-300" placeholder="Bolagsnamn" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Kontakt</label>
              <input required name="name" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none placeholder:text-slate-300" placeholder="Namn" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Telefon</label>
              <input required name="phone" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none placeholder:text-slate-300" placeholder="070..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">E-post</label>
            <input required name="email" type="email" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none placeholder:text-slate-300" placeholder="namn@foretag.se" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Motivering</label>
            <textarea required name="message" rows={3} className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none placeholder:text-slate-300" placeholder="Kort om varför ni vill vara med..."></textarea>
          </div>
          <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
            Skicka ansökan <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// --- LOGO COMPONENTS ---
const SGSLogo = () => (
  <div className="w-full h-full flex items-center justify-start">
    <div className="flex flex-col">
      <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none">SGS</div>
      <div className="text-[9px] text-slate-400 font-bold tracking-[0.3em] uppercase">Studentbostäder</div>
    </div>
  </div>
);

const SecretLogo = () => (
  <div className="w-full h-full flex items-center justify-start">
    <div className="flex items-center gap-3">
        <div className="bg-slate-100 p-2 rounded-full">
            <Lock className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex flex-col gap-1">
            <div className="h-3 w-24 bg-slate-200 rounded-full"></div>
            <div className="h-3 w-16 bg-slate-200 rounded-full"></div>
        </div>
    </div>
  </div>
);

const AvailableLogo = () => (
  <div className="w-full h-full flex items-center justify-start">
    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
      <Plus className="w-6 h-6" />
    </div>
  </div>
);

// --- PARTNER CARD (CLEAN DESIGN LIKE IMAGE) ---
function PartnerCard({ slot, onOpenModal }: { slot: typeof PARTNER_SLOTS[0], onOpenModal: () => void }) {
  const isAvailable = slot.status === "available";
  
  return (
    <div 
      className="bg-white p-8 rounded-sm shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-lg border border-transparent hover:border-slate-200 transition-all duration-300 flex flex-col h-full group"
    >
      {/* Top Line / Category */}
      <div className="border-b border-slate-100 pb-4 mb-6">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {slot.category}
        </span>
      </div>

      {/* Logo Area */}
      <div className="h-16 mb-6">
         {slot.logoType === 'sgs' && <SGSLogo />}
         {slot.logoType === 'secret' && <SecretLogo />}
         {slot.logoType === 'available' && <AvailableLogo />}
      </div>

      {/* Content */}
      <div className="flex-grow">
        <h3 className={`text-xl font-bold mb-3 ${isAvailable ? 'text-slate-400' : 'text-slate-900'}`}>
            {slot.name}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed">
            {slot.description}
        </p>
      </div>

      {/* Footer Link */}
      <div className="mt-8 pt-4">
        <button 
            onClick={isAvailable ? onOpenModal : undefined}
            className={`
                text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-all group/link
                ${isAvailable ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-900 hover:text-slate-600'}
            `}
        >
            {isAvailable ? 'Ansök nu' : 'Läs mer'}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
        </button>
      </div>
    </div>
  );
}


// --- MAIN PAGE ---
export default function FoundingPartnerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const availableCount = PARTNER_SLOTS.filter(s => s.status === "available").length;

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">Endast {availableCount} platser kvar</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-slate-900">
            Bli medgrundare till <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-800">
              framtidens plattform
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Vi söker strategiska partners som vill forma marknadens infrastruktur från insidan, snarare än att bara använda den.
          </p>
          
          <div className="flex justify-center">
            <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
              Ansök om partnerskap <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. THE PARTNER GRID (UPDATED - CLEAN STYLE) */}
      <section className="py-24 px-6 bg-[#FAFAF9] border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          {/* Header removed for cleaner look, or keep minimal */}
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Strategiska Partners</h2>
            <p className="text-slate-500 max-w-2xl">
                Våra founding partners representerar olika vertikaler i ekosystemet. Tillsammans bygger vi en heltäckande infrastruktur.
            </p>
          </div>
          
          {/* Grid Layout - 3 columns to match the image style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PARTNER_SLOTS.map((slot) => (
              <PartnerCard 
                key={slot.id}
                slot={slot} 
                onOpenModal={() => setIsModalOpen(true)} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE BENEFITS */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Ett partnerskap utöver det vanliga</h2>
            <p className="text-slate-500 text-lg">
              Som Founding Partner får ni fördelar som aldrig kommer erbjudas igen efter lansering.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Fingerprint className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Strategiskt Inflytande</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Ni sitter med vid ritbordet. Påverka produktens roadmap och se till att era specifika behov prioriteras i utvecklingen av integrationer och funktioner.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Roadmap Voting</span>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-slate-800 rounded-full"></div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-slate-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Evig Prisfördel</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Vi låser era villkor för all framtid. 12 månader kostnadsfritt efter lansering, därefter en garanterad "Legacy Discount" på 50% för alltid.
              </p>
              <div className="flex items-end gap-3 h-16 mt-auto">
                <div className="w-1/3 h-8 bg-slate-100 rounded-t-sm mx-auto relative group-hover:h-10 transition-all"></div>
                <div className="w-1/3 h-12 bg-slate-200 rounded-t-sm mx-auto relative group-hover:h-14 transition-all"></div>
                <div className="w-1/3 h-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm mx-auto relative shadow-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">-50%</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Exklusiv Branding</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Ert varumärke cementeras som en pionjär. Ni syns som officiell Founding Partner i plattformen och i vår externa kommunikation.
              </p>
              <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="h-2 w-16 bg-white/20 rounded mb-1"></div>
                  <div className="h-1.5 w-10 bg-emerald-500 rounded"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CTA BOTTOM */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 rotate-3 hover:rotate-8 transition-transform duration-500 cursor-pointer">
              <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Säkra er position innan dörren stängs
          </h2>
          <p className="text-slate-600 text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
            Vi väljer ut partners löpande. Skicka in en intresseanmälan för att boka en sluten visning av plattformen och ta del av founding-villkoren.
          </p>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group px-12 py-5 bg-slate-900 text-white font-bold text-lg rounded-2xl transition-all shadow-xl hover:shadow-slate-900/20 flex items-center justify-center gap-3 mx-auto hover:-translate-y-1"
          >
            Starta ansökningsprocessen
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-8 text-sm text-slate-500 font-medium">
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Ej bindande
            </span>
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Konfidentiell behandling
            </span>
          </div>
        </div>
      </section>

      <ApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}