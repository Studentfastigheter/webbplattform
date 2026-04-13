import ApplicationsInsights, {
  type ApplicationsMode,
} from "../_components/ApplicationsInsights";

export default function Ansokningar({
  mode = "interest",
}: {
  mode?: ApplicationsMode;
}) {
  return <ApplicationsInsights mode={mode} />;
}
