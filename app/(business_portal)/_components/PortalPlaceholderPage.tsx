import Link from "next/link";
import { Clock3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardRelPath } from "../_statics/variables";

type PortalPlaceholderPageProps = {
  title: string;
  description: string;
  notes?: string[];
};

export default function PortalPlaceholderPage({
  title,
  description,
  notes = [],
}: PortalPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="max-w-2xl text-sm text-gray-600">{description}</p>
      </header>

      <Card className="border-dashed border-gray-300 bg-white">
        <CardHeader className="gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <Clock3 className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>Implementeras snart</CardTitle>
            <CardDescription>
              Den här delen av portalen finns planerad men är inte färdigbyggd än.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-gray-600">
          {notes.length > 0 ? (
            <ul className="space-y-2">
              {notes.map((note) => (
                <li key={note} className="rounded-lg bg-gray-50 px-4 py-3">
                  {note}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            Under tiden kan du fortsätta arbeta i övriga delar av portalen.
          </div>

          <Link
            href={dashboardRelPath}
            className="inline-flex items-center text-sm font-medium text-[#004225] hover:underline"
          >
            Tillbaka till översikten
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
