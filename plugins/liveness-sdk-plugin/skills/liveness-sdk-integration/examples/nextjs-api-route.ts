import { NextRequest, NextResponse } from "next/server";
import { LivenessApiClient } from "@liveness/api-client";

const client = new LivenessApiClient({
  apiKey: process.env.LIVENESS_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetId } = body;

    // Forward verification to Liveness Cloud API using client SDK
    if (targetId) {
      const data = await client.liveness.verifyOne(body);
      return NextResponse.json(data);
    }

    const data = await client.liveness.verify(body);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal verification error." },
      { status: error.status || 500 },
    );
  }
}
