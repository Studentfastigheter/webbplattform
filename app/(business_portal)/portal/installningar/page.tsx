
import Settings from "../../_pages/settings";


export type Floorplan = {
    id: string;
    alias: string;
    file: File;
}

// Mocked initial floorplans
async function getFetchedFloorplans() {
  return [
    { id: "seed-1", alias: "2 rok 45 kvm", file: new File([], "planlosning.pdf") },
  ] as Floorplan[];
}


export default async function SettingsPage() {

  const fetchedFloorplans = await getFetchedFloorplans();


  return (
    <Settings 
      fetchedFloorplans={fetchedFloorplans}
    />
  )

}