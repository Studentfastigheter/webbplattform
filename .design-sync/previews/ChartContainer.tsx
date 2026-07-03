import { ChartContainer } from 'campuslyan';
import { BarChart, Bar, XAxis, CartesianGrid } from 'recharts';

// ChartContainer wraps recharts' ResponsiveContainer, which needs a sized
// parent — so each chart lives in a fixed-size div. `config` injects the
// --color-<key> CSS var (brand green) that the <Bar> fill references. We
// override the component's `aspect-video` with h-full/w-full so it fills the box.

const config = { listings: { label: 'Annonser', color: '#004225' } };

const listings = [
  { month: 'Jan', listings: 28 },
  { month: 'Feb', listings: 41 },
  { month: 'Mar', listings: 55 },
  { month: 'Apr', listings: 48 },
  { month: 'Maj', listings: 72 },
  { month: 'Jun', listings: 63 },
];

const applications = [
  { month: 'Jan', listings: 120 },
  { month: 'Feb', listings: 186 },
  { month: 'Mar', listings: 243 },
  { month: 'Apr', listings: 201 },
  { month: 'Maj', listings: 312 },
  { month: 'Jun', listings: 287 },
];

const caption: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 10 };

export const Listings = () => (
  <div style={{ width: 380 }}>
    <div style={caption}>Nya annonser per månad</div>
    <div style={{ width: 380, height: 220 }}>
      <ChartContainer config={config} className="aspect-auto h-full w-full">
        <BarChart data={listings} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <Bar dataKey="listings" fill="var(--color-listings)" radius={6} />
        </BarChart>
      </ChartContainer>
    </div>
  </div>
);

export const Applications = () => (
  <div style={{ width: 380 }}>
    <div style={caption}>Ansökningar per månad</div>
    <div style={{ width: 380, height: 220 }}>
      <ChartContainer config={config} className="aspect-auto h-full w-full">
        <BarChart data={applications} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <Bar dataKey="listings" fill="var(--color-listings)" radius={6} />
        </BarChart>
      </ChartContainer>
    </div>
  </div>
);
