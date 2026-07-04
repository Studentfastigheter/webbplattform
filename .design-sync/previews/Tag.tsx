import { Tag } from 'campuslyan';

const row: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' };

export const Amenities = () => (
  <div style={row}>
    <Tag text="Möblerad" />
    <Tag text="Balkong" />
    <Tag text="Nära campus" />
    <Tag text="Tvättmaskin" />
  </div>
);

export const Colored = () => (
  <div style={row}>
    <Tag text="Verifierad hyresvärd" bgColor="#E8F5EE" textColor="#075C39" />
    <Tag text="Nyproduktion" bgColor="#FEF3F2" textColor="#B42318" />
    <Tag text="Korttidskontrakt" bgColor="#F0F4FF" textColor="#3538CD" />
  </div>
);

export const WithStatusDot = () => (
  <div style={row}>
    <Tag text="Tillgänglig 1 sep" showDot dotColor="#12B76A" bgColor="#ECFDF3" textColor="#027A48" />
    <Tag text="Uthyrd" showDot dotColor="#98A2B3" bgColor="#F7F8F7" textColor="#475467" />
    <Tag text="Ny annons" showDot dotColor="#004225" />
  </div>
);

export const Sizes = () => (
  <div style={row}>
    <Tag text="32 m²" height={20} fontSize={12} horizontalPadding={10} />
    <Tag text="1 rum och kök" height={25} fontSize={14} />
    <Tag text="6 500 kr/mån" height={30} fontSize={15} bgColor="#004225" textColor="#FFFFFF" />
  </div>
);
