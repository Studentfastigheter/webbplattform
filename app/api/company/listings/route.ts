import { NextRequest, NextResponse } from "next/server";

import { API_BASE } from "@/lib/api-client";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      { message: "Saknar inloggning för publicering." },
      { status: 401 },
    );
  }

  const body = await request.text();

  try {
    const backendResponse = await fetch(`${API_BASE}/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        Host: "company.campuslyan.se",
        "X-Forwarded-Host": "company.campuslyan.se",
      },
      body,
      cache: "no-store",
    });

    const responseBody = await backendResponse.text();
    const contentType =
      backendResponse.headers.get("content-type") ?? "application/json";

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Kunde inte kontakta backend vid publicering.",
      },
      { status: 502 },
    );
  }
}
