import { getApplicantsTableData } from "@/lib/actions";
import ApplicationsInsights, {
  type ApplicationsMode,
} from "../_components/ApplicationsInsights";

export default function Ansokningar({
  mode = "interest",
}: {
  mode?: ApplicationsMode;
}) {
  const applicantsTableProps = getApplicantsTableData({ pageSize: 20 });

  return (
    <ApplicationsInsights
      applicantsTableProps={applicantsTableProps}
      mode={mode}
    />
  );
}
