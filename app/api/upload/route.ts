import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage/upload";
import { auth } from "@clerk/nextjs/server";
import { limiter } from "@/lib/rate-limit";

// Allow uploads up to 4.5MB (Vercel serverless limit needs to be respected, but blob direct upload is better. 
// For this simple route using server as proxy, body size limit applies. 
// Next.js default is 4MB. 
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit uploads (e.g. 50 per hour)
  try {
     const limit = await limiter.checkLimit(userId + "-upload", 50);
     if (!limit.success) {
         return NextResponse.json({ error: "Upload limit exceeded" }, { status: 429 });
     }
  } catch (e) {
      console.error("Rate limit error", e);
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 4.5 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large (max 4.5MB)" }, { status: 400 });
    }

    const url = await uploadFile(file, "event-assets");

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
