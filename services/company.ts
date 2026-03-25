import { authService } from "@/services/auth-service";
import { apiClient } from "@/lib/api-client";

export type GraphEntry = {
	category: string,
	value: number,
};

export type TimelineEntry = {
	timestamp: Date,
	value: number,
};

export type CompanyInfo = {
  userId: string,
  name: string,
};

function getLocalCompanyInfo(): CompanyInfo {
  const local = localStorage.getItem("MY_COMPANY");
  if (local === null) {
    return null;
  }
  return JSON.parse(local) as CompanyInfo;
}

function setLocalCompanyInfo(info: CompanyInfo) {
  localStorage.setItem("MY_COMPANY", JSON.stringify(info));
}

async function getCompanyId(): string {
	const local = getLocalCompanyInfo();
  if (local === null) {
    const info = await companyService.myCompany();
    setLocalCompanyInfo(info);
    return info.userId;
  }
	return local.userId;
}

export const companyService = {

  myCompany: async (): Promise<CompanyInfo> => {
    const result = await authService.me();
    if (result.accountType === "student") {
      throw new Error("Denna funktion är inte tillgänglig för studenter. Försök att logga in som uthyrare istället.");
    }
    return { userId: result.id, name: result.companyName };
  },
  applicationCount: async (): Promise<number> => {
    const id = await getCompanyId();
    return apiClient<number>(`/analytics/${id}/current_applications`);
  },
};
