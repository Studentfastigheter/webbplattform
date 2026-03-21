import { makeCompanyRequest } from "@/lib/api-company";

export type GraphEntry = {
	category: string,
	value: number,
};

export type TimelineEntry = {
	timestamp: Date,
	value: number,
};

function getCompanyId(): string {
	// TODO: Use active id
	return "demo";
}

function parseGraphEntries(json: object[]): GraphEntry[] {
	// TODO: Potentially per-response translation.
	return json as GraphEntry[];
}

function parseTimelineEntries(json: object[]): TimelineEntry[] {
	// TODO: Potentially per-response translation.
	return json as TimelineEntry[];
}

export const companyService = {
	residentsBySchool: async (): Promise<GraphEntry[]> => {
		return parseGraphEntries(await makeCompanyRequest<object[]>("/residents/by_school", getCompanyId(), {}));
	},
	residentsByCity: async (): Promise<GraphEntry[]> => {
		return parseGraphEntries(await makeCompanyRequest<object[]>("/residents/by_city", getCompanyId(), {}));
	},
	residentsByGender: async (): Promise<GraphEntry[]> => {
		return parseGraphEntries(await makeCompanyRequest<object[]>("/residents/by_gender", getCompanyId(), {}));
	},
	applicationsOverTime: async (): Promise<TimelineEntry[]> => {
		return parseTimelineEntries(await makeCompanyRequest<object[]>("/applications", getCompanyId(), {}));
	},
};
