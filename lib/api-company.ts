import { apiClient } from "@/lib/api-client";

export async function makeCompanyRequest<T>(endpoint: string,
                                            { headers, ...others }: RequestInit = {},
	                                          token?: string): Promise<T> {
  return await apiClient<T>(endpoint,
                            {
                              headers: {
                                Host: "company.campuslyan.se",
                                ...headers
                              },
                              ...others
                            },
                            token);
}


