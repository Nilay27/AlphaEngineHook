import { NextRequest, NextResponse } from 'next/server'

// This is a debug endpoint to test GitHub webhook payload processing
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    console.log("=== DEBUG WEBHOOK START ===");
    console.log("Full payload:", JSON.stringify(payload, null, 2));
    console.log("Event type:", payload?.["x-github-event"] || req.headers.get("x-github-event"));
    console.log("Action:", payload?.action);
    console.log("PR merged status:", payload?.pull_request?.merged);
    
    // Check if this is a PR merged event
    const isPrMerged = payload?.pull_request?.merged === true && payload?.action === "closed";
    console.log("Is PR merged event:", isPrMerged);
    
    if (isPrMerged) {
      console.log("PR details:", {
        repo: `${payload.repository.owner.login}/${payload.repository.name}`,
        pr: payload.pull_request.number,
        title: payload.pull_request.title
      });
    }
    
    console.log("=== DEBUG WEBHOOK END ===");
    
    return NextResponse.json({ 
      message: "Debug webhook processed",
      isPrMerged,
      eventType: payload?.["x-github-event"] || req.headers.get("x-github-event"),
      action: payload?.action,
      merged: payload?.pull_request?.merged
    }, { status: 200 });
  } catch (error) {
    console.error("Error processing debug webhook:", error);
    return NextResponse.json({ 
      message: "Error processing debug webhook", 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

// Also support GET for testing the endpoint is accessible
export async function GET() {
  return NextResponse.json({ message: "GitHub webhook debug endpoint is active" }, { status: 200 });
} 