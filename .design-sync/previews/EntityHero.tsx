import { EntityHero, BadgeCheck, MapPin, Home, Star, Globe, Mail, Users } from 'campuslyan';

// EntityHero threw "Cannot read undefined" when title was missing. We pass a
// real title plus badge/meta/actions/sections. Images are intentionally omitted:
// the avatar falls back to a clean initial and the banner to a soft grey plate,
// which sidesteps next/image optimisation (no image server in the static shot).

const metaItem: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 5 };
const body: React.CSSProperties = { color: 'var(--muted-foreground)', lineHeight: 1.6, fontSize: 14, maxWidth: 640 };

export const Landlord = () => (
  <div style={{ width: 860 }}>
    <EntityHero
      title="Lundagård Fastigheter"
      badge={{ label: 'Verifierad hyresvärd', tone: 'success', icon: <BadgeCheck className="h-3.5 w-3.5" /> }}
      meta={
        <>
          <span style={metaItem}><MapPin className="h-4 w-4" /> Lund</span>
          <span style={metaItem}><Home className="h-4 w-4" /> 42 bostäder</span>
          <span style={metaItem}><Star className="h-4 w-4" /> 4,8 · 126 omdömen</span>
        </>
      }
      actionLinks={[
        { label: 'Webbplats', href: '#', icon: <Globe className="h-4 w-4" /> },
        { label: 'Kontakta', href: '#', icon: <Mail className="h-4 w-4" /> },
      ]}
      sections={[
        {
          title: 'Om hyresvärden',
          content: (
            <p style={body}>
              Lundagård Fastigheter erbjuder trygga, möblerade studentbostäder i centrala Lund. Alla
              lägenheter har fiberuppkoppling, tvättstuga i huset och gångavstånd till campus.
            </p>
          ),
        },
      ]}
    />
  </div>
);

export const Property = () => (
  <div style={{ width: 860 }}>
    <EntityHero
      title="Studentetta · Delphinvägen 12"
      avatarShape="circle"
      badge={{ label: 'Ledig från 1 sep', tone: 'warning', icon: <Home className="h-3.5 w-3.5" /> }}
      meta={
        <>
          <span style={metaItem}><MapPin className="h-4 w-4" /> Lund, Norra Fäladen</span>
          <span style={metaItem}><Users className="h-4 w-4" /> 1 rum · 24 m²</span>
          <span style={metaItem}><Star className="h-4 w-4" /> 6 200 kr/mån</span>
        </>
      }
      actionLinks={[
        { label: 'Spara', href: '#', icon: <Star className="h-4 w-4" /> },
        { label: 'Kontakta', href: '#', icon: <Mail className="h-4 w-4" /> },
      ]}
      sections={[
        {
          title: 'Beskrivning',
          content: (
            <p style={body}>
              Ljus och nyrenoverad etta med eget pentry och balkong mot innergården. Hyran inkluderar
              värme, vatten och bredband. Perfekt för dig som pluggar på LTH.
            </p>
          ),
        },
      ]}
    />
  </div>
);
