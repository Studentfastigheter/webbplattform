import { Tabs, TabsList, TabsTrigger, TabsContent } from 'campuslyan';

const panel: React.CSSProperties = { padding: '14px 6px', fontSize: 14, color: 'var(--muted-foreground)' };

export const Default = () => (
  <Tabs defaultValue="listings" style={{ width: 420 }}>
    <TabsList>
      <TabsTrigger value="listings">Annonser</TabsTrigger>
      <TabsTrigger value="applications">Ansökningar</TabsTrigger>
      <TabsTrigger value="saved">Sparade</TabsTrigger>
    </TabsList>
    <TabsContent value="listings"><div style={panel}>3 aktiva annonser i Lund och Malmö.</div></TabsContent>
    <TabsContent value="applications"><div style={panel}>Du har 12 pågående ansökningar.</div></TabsContent>
    <TabsContent value="saved"><div style={panel}>5 sparade bostäder.</div></TabsContent>
  </Tabs>
);

export const TwoTabs = () => (
  <Tabs defaultValue="rent" style={{ width: 320 }}>
    <TabsList>
      <TabsTrigger value="rent">Hyra</TabsTrigger>
      <TabsTrigger value="buy">Köpa</TabsTrigger>
    </TabsList>
    <TabsContent value="rent"><div style={panel}>Visar hyresbostäder för studenter.</div></TabsContent>
    <TabsContent value="buy"><div style={panel}>Visar bostäder till salu.</div></TabsContent>
  </Tabs>
);
