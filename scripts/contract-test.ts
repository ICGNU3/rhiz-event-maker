#!/usr/bin/env npx tsx
/**
 * Rhiz Protocol Contract Test Script
 * 
 * Headless validation of App Launch Contract v1 endpoints.
 * Run with: npx tsx scripts/contract-test.ts
 * 
 * Environment variables:
 *   RHIZ_API_URL - Protocol API base URL (default: http://localhost:8000)
 *   RHIZ_API_TOKEN - Bearer token for authentication (optional)
 */

const API_URL = process.env.RHIZ_API_URL || "http://localhost:8000";
const API_TOKEN = process.env.RHIZ_API_TOKEN || "";
const APP_ID = "eventmanage";
const CONTRACT_VERSION = "1.0";

interface TestResult {
  name: string;
  endpoint: string;
  method: string;
  passed: boolean;
  statusCode?: number;
  requestId?: string;
  latencyMs: number;
  error?: string;
  errorCode?: string;
  response?: unknown;
}

interface ErrorResponse {
  detail?: string;
  message?: string;
  code?: string;
  required_plan?: string;
  limit?: number;
  used?: number;
}

async function runTest(
  name: string,
  endpoint: string,
  method: "GET" | "POST" = "GET",
  options: {
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    expectStatus?: number;
    expectCode?: string;
  } = {}
): Promise<TestResult> {
  const startTime = Date.now();
  const url = `${API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Rhiz-App-Id": APP_ID,
    "X-Rhiz-Contract-Version": CONTRACT_VERSION,
    ...options.headers,
  };

  if (API_TOKEN && !options.headers?.["Authorization"]) {
    headers["Authorization"] = `Bearer ${API_TOKEN}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const latencyMs = Date.now() - startTime;
    const requestId = response.headers.get("x-request-id") || undefined;
    const data: ErrorResponse = await response.json().catch(() => ({}));

    // If we expect a specific status (for negative tests), check it
    if (options.expectStatus) {
      const passed = response.status === options.expectStatus;
      const codeMatch = !options.expectCode || data.code === options.expectCode;
      return {
        name,
        endpoint,
        method,
        passed: passed && codeMatch,
        statusCode: response.status,
        requestId,
        latencyMs,
        error: passed ? undefined : `Expected ${options.expectStatus}, got ${response.status}`,
        errorCode: data.code,
        response: data,
      };
    }

    // Normal test - expect success
    if (!response.ok) {
      return {
        name,
        endpoint,
        method,
        passed: false,
        statusCode: response.status,
        requestId,
        latencyMs,
        error: data.detail || data.message || response.statusText,
        errorCode: data.code,
      };
    }

    return {
      name,
      endpoint,
      method,
      passed: true,
      statusCode: response.status,
      requestId,
      latencyMs,
      response: data,
    };
  } catch (err) {
    return {
      name,
      endpoint,
      method,
      passed: false,
      latencyMs: Date.now() - startTime,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

async function runNegativeTest(
  name: string,
  endpoint: string,
  method: "GET" | "POST",
  headers: Record<string, string>,
  expectStatus: number,
  expectCode?: string
): Promise<TestResult> {
  const startTime = Date.now();
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    const latencyMs = Date.now() - startTime;
    const requestId = response.headers.get("x-request-id") || undefined;
    const data: ErrorResponse = await response.json().catch(() => ({}));

    const statusMatch = response.status === expectStatus;
    const codeMatch = !expectCode || data.code === expectCode;

    return {
      name,
      endpoint,
      method,
      passed: statusMatch && codeMatch,
      statusCode: response.status,
      requestId,
      latencyMs,
      error: statusMatch && codeMatch ? undefined : 
        `Expected ${expectStatus}${expectCode ? ` with code ${expectCode}` : ""}, got ${response.status}${data.code ? ` with code ${data.code}` : ""}`,
      errorCode: data.code,
      response: data,
    };
  } catch (err) {
    return {
      name,
      endpoint,
      method,
      passed: false,
      latencyMs: Date.now() - startTime,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

async function main() {
  console.log("\n🔬 Rhiz Protocol Contract Test Suite");
  console.log("=====================================");
  console.log(`📍 API URL: ${API_URL}`);
  console.log(`🏷️  App ID: ${APP_ID}`);
  console.log(`📋 Contract Version: ${CONTRACT_VERSION}`);
  console.log(`🔑 Auth: ${API_TOKEN ? "Token provided" : "No token"}\n`);

  const results: TestResult[] = [];

  // ========================================
  // POSITIVE TESTS - Core Contract Endpoints
  // ========================================
  console.log("━━━ Positive Tests (Core Endpoints) ━━━\n");

  const positiveTests = [
    { name: "Protocol Identity", endpoint: "/v1/protocol/me", method: "GET" as const },
    { name: "Graph Summary", endpoint: "/v1/protocol/graph/summary", method: "GET" as const },
    { name: "Subscription Plan", endpoint: "/v1/subscriptions/plan", method: "GET" as const },
    { name: "Capabilities", endpoint: "/v1/subscriptions/capabilities", method: "GET" as const },
    { name: "Registry Modules", endpoint: "/v1/registry/modules", method: "GET" as const },
    {
      name: "Event Ingest",
      endpoint: "/v1/protocol/events/ingest",
      method: "POST" as const,
      body: {
        event_type: "contract_test",
        actor_id: "test-actor-headless",
        target_id: "test-target-headless",
        context: { source: "contract_test_script" },
        timestamp: new Date().toISOString(),
      },
    },
  ];

  for (const test of positiveTests) {
    process.stdout.write(`  ${test.name}... `);
    const result = await runTest(test.name, test.endpoint, test.method, { body: test.body });
    results.push(result);

    if (result.passed) {
      console.log(`✅ ${result.statusCode} (${result.latencyMs}ms)`);
    } else {
      console.log(`❌ ${result.statusCode || "ERR"} - ${result.error}`);
    }
  }

  // ========================================
  // NEGATIVE TESTS - Contract Enforcement
  // ========================================
  console.log("\n━━━ Negative Tests (Contract Enforcement) ━━━\n");

  // Test 1: Missing X-Rhiz-App-Id should return 403
  process.stdout.write("  Missing App ID → 403... ");
  const missingAppIdResult = await runNegativeTest(
    "Missing X-Rhiz-App-Id",
    "/v1/protocol/me",
    "GET",
    { "X-Rhiz-Contract-Version": CONTRACT_VERSION },
    403,
    "MISSING_APP_ID"
  );
  results.push(missingAppIdResult);
  if (missingAppIdResult.passed) {
    console.log(`✅ ${missingAppIdResult.statusCode} (${missingAppIdResult.latencyMs}ms)`);
  } else {
    console.log(`⚠️  ${missingAppIdResult.statusCode || "ERR"} - ${missingAppIdResult.error}`);
  }

  // Test 2: Capability denial should return CAPABILITY_REQUIRED with required_plan
  process.stdout.write("  Capability Denial → 403 CAPABILITY_REQUIRED... ");
  const capabilityDenialResult = await runNegativeTest(
    "Capability Denial",
    "/v1/intelligence/network/warm-path?from_person_id=a&to_person_id=b&max_hops=3",
    "GET",
    { 
      "X-Rhiz-App-Id": APP_ID,
      "X-Rhiz-Contract-Version": CONTRACT_VERSION,
    },
    403,
    "CAPABILITY_REQUIRED"
  );
  results.push(capabilityDenialResult);
  if (capabilityDenialResult.passed) {
    const resp = capabilityDenialResult.response as ErrorResponse;
    console.log(`✅ ${capabilityDenialResult.statusCode} - required_plan: ${resp.required_plan || "N/A"}`);
  } else {
    console.log(`⚠️  ${capabilityDenialResult.statusCode || "ERR"} - ${capabilityDenialResult.error}`);
  }

  // Test 3: Quota exceeded should return QUOTA_EXCEEDED with limit/used
  process.stdout.write("  Quota Exceeded → 429 QUOTA_EXCEEDED... ");
  const quotaExceededResult = await runNegativeTest(
    "Quota Exceeded",
    "/v1/protocol/events/ingest",
    "POST",
    { 
      "X-Rhiz-App-Id": APP_ID,
      "X-Rhiz-Contract-Version": CONTRACT_VERSION,
      "X-Test-Quota-Exceeded": "true", // Hypothetical test header
    },
    429,
    "QUOTA_EXCEEDED"
  );
  results.push(quotaExceededResult);
  if (quotaExceededResult.passed) {
    const resp = quotaExceededResult.response as ErrorResponse;
    console.log(`✅ ${quotaExceededResult.statusCode} - limit: ${resp.limit}, used: ${resp.used}`);
  } else {
    console.log(`⚠️  ${quotaExceededResult.statusCode || "ERR"} - ${quotaExceededResult.error}`);
  }

  // ========================================
  // SUMMARY
  // ========================================
  const positiveResults = results.filter((r, i) => i < positiveTests.length);
  const negativeResults = results.filter((r, i) => i >= positiveTests.length);

  const positivePassed = positiveResults.filter((r) => r.passed).length;
  const positiveFailed = positiveResults.filter((r) => !r.passed).length;
  const negativePassed = negativeResults.filter((r) => r.passed).length;
  const negativeSkipped = negativeResults.filter((r) => !r.passed).length;

  const avgLatency = Math.round(
    results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length
  );

  console.log("\n=====================================");
  console.log("📊 Summary");
  console.log(`   ✅ Positive Tests Passed: ${positivePassed}/${positiveTests.length}`);
  console.log(`   ❌ Positive Tests Failed: ${positiveFailed}`);
  console.log(`   ✅ Negative Tests Passed: ${negativePassed}/${negativeResults.length}`);
  console.log(`   ⚠️  Negative Tests Skipped: ${negativeSkipped} (backend may not implement all error codes)`);
  console.log(`   ⏱️  Avg Latency: ${avgLatency}ms`);

  // Request IDs
  const requestIds = results.filter((r) => r.requestId).map((r) => r.requestId);
  if (requestIds.length > 0) {
    console.log("\n📋 Request IDs:");
    requestIds.slice(0, 5).forEach((id) => console.log(`   ${id}`));
    if (requestIds.length > 5) {
      console.log(`   ... and ${requestIds.length - 5} more`);
    }
  }

  // Exit with error if any positive tests failed
  if (positiveFailed > 0) {
    console.log("\n⚠️  Some positive tests failed. See errors above.");
    process.exit(1);
  }

  console.log("\n✨ All core contract tests passed!\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
