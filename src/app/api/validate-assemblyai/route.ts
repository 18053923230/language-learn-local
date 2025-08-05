import { NextRequest, NextResponse } from "next/server";

const ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com/v2";

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Test the API key by making a simple request to AssemblyAI
    const response = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript`, {
      method: "GET",
      headers: {
        Authorization: apiKey,
      },
    });

    // If we get a 401, the API key is invalid
    if (response.status === 401) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // If we get a 403, the API key might be valid but doesn't have the right permissions
    if (response.status === 403) {
      return NextResponse.json(
        { error: "API key doesn't have required permissions" },
        { status: 403 }
      );
    }

    // If we get any other error, we'll assume the API key is invalid
    if (!response.ok) {
      return NextResponse.json(
        { error: "API key validation failed" },
        { status: 400 }
      );
    }

    // If we get here, the API key is valid
    return NextResponse.json({
      valid: true,
      message: "API key is valid",
    });
  } catch (error) {
    console.error("API key validation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
