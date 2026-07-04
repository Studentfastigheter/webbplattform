"use client";

import { useState } from "react";
import { adminService } from "@/features/admin/services/admin-service";
import {
  type AdminActionState,
  normalizeDateTimeInput,
  ResultBlock,
  ActionShell,
  FormInput,
  SubmitButton,
} from "../shared";

function UserStatisticsAction() {
  // Note: this section just fires the request and reports success/error —
  // the response payload is never rendered. Wrapping in a `useQuery` would
  // add cache/loading plumbing for no gain. Direct service call is the
  // correct shape here.
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [state, setState] = useState<AdminActionState>({ status: "idle" });

  async function run() {
    setState({ status: "loading", message: "Hämtar statistik..." });
    try {
      await adminService.getUserStatistics({
        from: normalizeDateTimeInput(from),
        to: normalizeDateTimeInput(to),
      });
      setState({ status: "success", message: "Statistik hämtad." });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Anropet misslyckades.",
      });
    }
  }

  return (
    <ActionShell
      title="Registrerade användare"
      description="Välj start- och slutdatum för att hämta registreringar som tidsserie."
      method="GET"
      endpoint="/api/admin/statistics/users"
    >
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <FormInput label="Från" type="datetime-local" value={from} onChange={setFrom} />
        <FormInput label="Till" type="datetime-local" value={to} onChange={setTo} />
      </div>
      <SubmitButton isLoading={state.status === "loading"} onPress={run}>
        Hämta statistik
      </SubmitButton>
      <ResultBlock state={state} />
    </ActionShell>
  );
}

export default function StatisticsSection() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <UserStatisticsAction />
    </div>
  );
}
