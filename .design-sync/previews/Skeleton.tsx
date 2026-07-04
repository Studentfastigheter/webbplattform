import { Skeleton } from 'campuslyan';

export const ListingCard = () => (
  <div style={{ width: 300, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--card)' }}>
    <Skeleton className="h-40 w-full rounded-none" />
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </div>
  </div>
);

export const ProfileHeader = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: 280 }}>
    <Skeleton className="size-12 rounded-full" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

export const TextLines = () => (
  <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 10 }}>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);
