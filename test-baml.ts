
import { b as baml } from "@/lib/baml_client/baml_client";

async function testBaml() {
  console.log("Starting BAML test...");
  try {
    const start = Date.now();
    const config = await baml.GenerateEventAppConfig(
      "A futuristic conference about AI Agents",
      "Dec 15, 2025",
      "San Francisco",
      ["Networking", "Innovation"],
      "Founders",
      "medium",
      "standard",
      "high",
      "standard",
      "professional"
    );
    console.log("BAML finished in", (Date.now() - start) / 1000, "s");
    console.log("Config:", JSON.stringify(config, null, 2));
  } catch (e) {
    console.error("BAML Error:", e);
  }
}

testBaml();
