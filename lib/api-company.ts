
const STATUS_MESSAGES: Record<number, string> = {
  400: "Ogiltig förfrågan. Kontrollera fälten och försök igen.",
  401: "Du måste vara inloggad för att göra detta.",
  403: "Du har inte behörighet att göra detta.",
  404: "Vi kunde inte hitta det du söker.",
  409: "Uppgifterna används redan.",
  422: "Vissa fält saknas eller är felaktiga.",
  429: "För många försök, vänta en stund och prova igen.",
  500: "Serverfel. Försök igen om en liten stund.",
  503: "Tjänsten är tillfälligt nere. Försök igen snart.",
};

function selectAuthenticationToken(suggestedToken?: string): string? {
	if (suggestedToken !== null) {
		return suggestedToken;
	}
	return window?.localStorage?.getItem('token');
}

function cleanPath(path: string): string {
	if (path.endsWith('/')) {
		return path.substr(0, path.length - 1);
	}
	return path;
}

const COMPANY_BASE_URL = process?.env?.COMPANY_API_BASE ?? "http://company.localhost:8080"; // TODO: Missing actual URL

async function getResponseJson(response: Response): object {
	try {
		return JSON.parse(await response.text().catch(() => "{}"));
	} catch (_) {
		throw new Error("Servern skickade ett oväntat svar.");
	}
}

function getErrorMessage(json: object, status: number, statusText?: string): string {
	if (json.message !== null) {
		return json.message;
	} else if (json.error !== null) {
		return json.error;
	} else if (typeof json === "string") {
		return json;
	} else if (STATUS_MESSAGES[status] !== null) {
		return STATUS_MESSAGES[status];
	} else if (statusText !== null) {
		return statusText;
	}
	return `Något gick fel (${res.status}).`;
}

export async function makeCompanyRequest<T>(endpoint: string,
																				    companyId: string,
																				    { headers, ...customOptions }: RequestInit,
																				    token?: string): Promise<T> {
	const requestHeaders: Record<string, string> = {
		"Content-Type": "application/json",
		...(headers as Record<string, string>),
	};

	const authenticationToken = selectAuthenticationToken(token);
	if (authenticationToken !== null) {
		requestHeaders.Authorization = `Bearer ${authenticationToken}`;
	}

	const requestUrl = `${COMPANY_URL_BASE}/${companyId}/${cleanPath(endpoint.trim('/'))}`;
	const response: Response = await fetch(requestUrl,
																				 {
      																			...customOptions,
      																			headers: defaultHeaders,
      																			cache: customOptions.cache ?? "no-store",
    																		 });
  // No content response.
  if (response.status === 204) {
		return {} as T; 
	}

	if (!response.ok) {
		if (response.status === 401) {
			localStorage?.removeItem('token');
		}
		throw new Error(getErrorMessage(getResponseJson(response), response.status, response.statusText));
	}
	return await getResponseJson(response) as T;
}


