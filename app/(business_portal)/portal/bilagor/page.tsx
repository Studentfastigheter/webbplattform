
import { getFloorplans, getRequirementProfiles } from "@/lib/actions";
import Bilagor from "../../_pages/bilagor";

export default function BilagorPage() {
    const floorplansPromise = getFloorplans();
    const requirementProfilesPromise = getRequirementProfiles();

    return (
        <Bilagor 
            floorplansPromise={floorplansPromise} 
            requirementProfilesPromise={requirementProfilesPromise}
        />
    )
}