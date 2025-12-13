"use client";

import { useState } from "react";

interface TestResult {
  endpoint: string;
  status: "pending" | "success" | "error";
  data?: unknown;
  error?: string;
  requestId?: string;
  latencyMs?: number;
}

const PROTOCOL_API_URL = process.env.NEXT_PUBLIC_RHIZ_API_URL || "http://localhost:8000";

export default function ProtocolTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [ingestPayload, setIngestPayload] = useState(JSON.stringify({
    event_type: "test_interaction",
    actor_id: "test-actor-001",
    target_id: "test-target-001",
    context: { source: "contract_test_ui" },
    timestamp: new Date().toISOString(),
  }, null, 2));

  const runTest = async (endpoint: string, method: "GET" | "POST" = "GET", body?: string) => {
    const startTime = performance.now();
    try {
      const response = await fetch(`${PROTOCOL_API_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Rhiz-App-Id": "eventmanage",
        },
        body: method === "POST" ? body : undefined,
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const requestId = response.headers.get("x-request-id") || undefined;
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        return { 
          endpoint, 
          status: "error" as const, 
          error: `${response.status}: ${errorData.detail || errorData.message}`,
          requestId,
          latencyMs,
        };
      }

      const data = await response.json();
      return { 
        endpoint, 
        status: "success" as const, 
        data, 
        requestId,
        latencyMs,
      };
    } catch (err) {
      return { 
        endpoint, 
        status: "error" as const, 
        error: err instanceof Error ? err.message : "Unknown error",
        latencyMs: Math.round(performance.now() - startTime),
      };
    }
  };

  const runContractTests = async () => {
    setIsRunning(true);
    setResults([]);

    const testEndpoints: { endpoint: string; method: "GET" | "POST"; body?: string }[] = [
      { endpoint: "/v1/protocol/me", method: "GET" },
      { endpoint: "/v1/protocol/graph/summary", method: "GET" },
      { endpoint: "/v1/subscriptions/plan", method: "GET" },
      { endpoint: "/v1/subscriptions/capabilities", method: "GET" },
      { endpoint: "/v1/registry/modules", method: "GET" },
    ];

    const newResults: TestResult[] = [];

    for (const test of testEndpoints) {
      const result = await runTest(test.endpoint, test.method, test.body);
      newResults.push(result);
      setResults([...newResults]);
    }

    setIsRunning(false);
  };

  const runIngestTest = async () => {
    setIsRunning(true);
    const result = await runTest("/v1/protocol/events/ingest", "POST", ingestPayload);
    setResults((prev) => [...prev, result]);
    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult["status"]) => {
    if (status === "success") return "text-green-400";
    if (status === "error") return "text-red-400";
    return "text-yellow-400";
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    if (status === "success") return "✓";
    if (status === "error") return "✗";
    return "○";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            🔬 Rhiz Protocol Contract Test Suite
          </h1>
          <p className="text-gray-400 mt-2">
            App Launch Contract v1 • App ID: <code className="text-cyan-300">eventmanage</code>
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={runContractTests}
            disabled={isRunning}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isRunning ? "Running..." : "Run Contract Tests"}
          </button>
        </div>

        {/* Ingest Test Section */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-violet-300">📥 Ingest Test Interaction</h2>
          <textarea
            value={ingestPayload}
            onChange={(e) => setIngestPayload(e.target.value)}
            className="w-full h-40 bg-gray-900 text-gray-200 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none"
          />
          <button
            onClick={runIngestTest}
            disabled={isRunning}
            className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium disabled:opacity-50 transition-all"
          >
            Ingest Event
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-300">Test Results</h2>
          
          {results.length === 0 && (
            <p className="text-gray-500 italic">No tests run yet. Click &quot;Run Contract Tests&quot; to begin.</p>
          )}

          {results.map((result, idx) => (
            <div
              key={idx}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xl ${getStatusColor(result.status)}`}>
                    {getStatusIcon(result.status)}
                  </span>
                  <code className="text-cyan-300">{result.endpoint}</code>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {result.latencyMs !== undefined && (
                    <span>{result.latencyMs}ms</span>
                  )}
                  {result.requestId && (
                    <span className="font-mono text-xs bg-gray-700 px-2 py-1 rounded">
                      req: {result.requestId.slice(0, 8)}...
                    </span>
                  )}
                </div>
              </div>

              {result.status === "error" && (
                <p className="text-red-400 text-sm mt-2">{result.error}</p>
              )}

              {result.status === "success" && result.data !== undefined ? (
                <pre className="text-xs text-gray-400 bg-gray-900 p-3 rounded mt-2 overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2) as string}
                </pre>
              ) : null}
            </div>
          ))}
        </div>

        {/* Contract Info */}
        <div className="mt-12 bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">📋 App Launch Contract v1 Endpoints</h2>
          <ul className="space-y-2 text-sm font-mono text-gray-400">
            <li><span className="text-cyan-400">GET</span> /v1/protocol/me</li>
            <li><span className="text-cyan-400">GET</span> /v1/protocol/graph/summary</li>
            <li><span className="text-violet-400">POST</span> /v1/protocol/events/ingest</li>
            <li><span className="text-cyan-400">GET</span> /v1/subscriptions/plan</li>
            <li><span className="text-cyan-400">GET</span> /v1/subscriptions/capabilities</li>
            <li><span className="text-cyan-400">GET</span> /v1/registry/modules</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
