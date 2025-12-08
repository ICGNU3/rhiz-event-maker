
import { NextResponse } from "next/server";
import { generateEventConfig } from "../../actions";

export async function GET() {
  const formData = new FormData();
  formData.append("eventBasics", "A futuristic conference about AI Agents");
  formData.append("eventDate", "Dec 15, 2025");
  formData.append("eventLocation", "SF");
  formData.append("goals", "Netowrking, AI");
  formData.append("audience", "Devs");
  
  try {
    console.log("API: calling generateEventConfig");
    const config = await generateEventConfig(formData);
    return NextResponse.json({ success: true, config });
  } catch (e) {
    console.error("API Error:", e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
