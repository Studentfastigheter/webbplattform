"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { qk } from "@/lib/query/keys";
import {
  RegistrationFunnelBlock,
  RegistrationMethodsBlock,
  UserKpiRow,
  VerificationOutcomesBlock,
} from "./UserInsightsBlocks";
import { UserListBlock } from "./UserListBlock";

export default function UsersSection() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: qk.admin.userInsightsAll });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          type="button"
          isLoading={refreshing}
          onPress={() => void refresh()}
          className="bg-brand text-white hover:bg-[#00351e]"
        >
          <RefreshCwIcon className="h-4 w-4" />
          Uppdatera
        </Button>
      </div>

      <UserKpiRow />
      <RegistrationMethodsBlock />
      <RegistrationFunnelBlock />
      <VerificationOutcomesBlock />
      <UserListBlock />
    </div>
  );
}
