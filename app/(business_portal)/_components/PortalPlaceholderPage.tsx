import Link from "next/link";
import { Clock3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardRelPath } from "../_statics/variables";

type PortalPlaceholderPageProps = {
  title: string;
  notes?: string[];
};

export default function PortalPlaceholderPage({
  title,
  notes = [],
}: PortalPlaceholderPageProps) {
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </header>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="flex flex-col items-start gap-4 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
            <Clock3 className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900">Kommer snart</h2>
            <p className="text-sm text-gray-500">Sidan är under arbete.</p>
          </div>

          {notes.length > 0 ? (
            <ul className="space-y-2 text-sm text-gray-600">
              {notes.map((note) => (
                <li
                  key={note}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  {note}
                </li>
              ))}
            </ul>
          ) : null}

          <Link
            href={dashboardRelPath}
            className="inline-flex items-center text-sm font-medium text-[#004225] hover:underline"
          >
            Till översikten
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
