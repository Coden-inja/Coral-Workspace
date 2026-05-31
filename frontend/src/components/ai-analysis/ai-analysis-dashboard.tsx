"use client";

import { useState } from "react";
import type { AiAnalysisSnapshot } from "@/contracts/ai-analysis";

import { AiConfidenceBreakdownSection } from "@/components/ai-analysis/ai-confidence-breakdown-section";
import { AiCorrelationTimelineSection } from "@/components/ai-analysis/ai-correlation-timeline-section";
import { AiExecutiveSummarySection } from "@/components/ai-analysis/ai-executive-summary-section";
import { AiFindingsSection } from "@/components/ai-analysis/ai-findings-section";
import { AiRecommendedActionsSection } from "@/components/ai-analysis/ai-recommended-actions-section";
import { AiRelatedInvestigationsSection } from "@/components/ai-analysis/ai-related-investigations-section";
import { AiRootCauseSection } from "@/components/ai-analysis/ai-root-cause-section";
import { SectionHeader } from "@/components/shared/section-header";

type AiAnalysisDashboardProps = {
  snapshot: AiAnalysisSnapshot;
};

export function AiAnalysisDashboard({ snapshot }: AiAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<"nl" | "sql">("nl");
  const [nlQuery, setNlQuery] = useState("Which employees resolved the most incidents?");
  const [sqlQuery, setSqlQuery] = useState("SELECT id, email, role FROM users LIMIT 5");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Results states
  const [nlResponse, setNlResponse] = useState<{ generated_sql?: string; conversational_response?: string } | null>(null);
  const [sqlResponse, setSqlResponse] = useState<any[] | null>(null);

  const handleNlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setNlResponse(null);

    try {
      const res = await fetch("/api/query/nl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: 1, query_text: nlQuery }),
      });

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();
      setNlResponse({
        generated_sql: data.generated_sql,
        conversational_response: data.conversational_response,
      });
    } catch (err: any) {
      setError(err.message || "An error occurred while executing the AI copilot query.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSqlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSqlResponse(null);

    try {
      const res = await fetch("/api/query/raw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: 1, sql_query: sqlQuery }),
      });

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.status === "error") {
        throw new Error(data.message);
      }
      setSqlResponse(data.query_results);
    } catch (err: any) {
      setError(err.message || "An error occurred while executing the raw SQL statement.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        variant="page"
        title="AI Operational Intelligence"
        description="Cross-source reasoning across GitHub, Slack, Sentry and investigations."
      />

      {/* 🚀 Sleek Multi-Scenario Interactive Console */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-850 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              Hybrid Stack Investigation Console
            </h2>
            <p className="text-xs text-zinc-400">Choose your execution engine mode.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab("nl"); setError(null); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "nl"
                  ? "bg-cyan-600/30 text-cyan-400 border border-cyan-500/50"
                  : "bg-zinc-900 text-zinc-400 border border-transparent hover:bg-zinc-850"
              }`}
            >
              👾 AI Copilot (Scenario 1)
            </button>
            <button
              onClick={() => { setActiveTab("sql"); setError(null); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "sql"
                  ? "bg-purple-600/30 text-purple-400 border border-purple-500/50"
                  : "bg-zinc-900 text-zinc-400 border border-transparent hover:bg-zinc-850"
              }`}
            >
              💾 SQL Console (Scenario 2)
            </button>
          </div>
        </div>

        {/* 👾 Tab 1: AI Copilot */}
        {activeTab === "nl" && (
          <form onSubmit={handleNlSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Enter your Natural Language Security Question:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-cyan-500/70 focus:outline-none"
                  placeholder="e.g. Which employees resolved the most incidents?"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-all"
                >
                  {isLoading ? "Analyzing..." : "Analyze Threat"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 💾 Tab 2: Developer SQL Console */}
        {activeTab === "sql" && (
          <form onSubmit={handleSqlSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Enter Raw SQL Query Statement:
              </label>
              <div className="flex flex-col gap-2">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={2}
                  className="w-full font-mono rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-purple-500/70 focus:outline-none"
                  placeholder="e.g. SELECT * FROM users LIMIT 5"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-all"
                  >
                    {isLoading ? "Executing..." : "Execute Query"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ⏳ Loader and Errors */}
        {isLoading && (
          <div className="mt-6 flex flex-col items-center justify-center p-8 rounded-lg border border-zinc-800/40 bg-zinc-900/10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-cyan-500" />
            <p className="mt-2 text-xs text-zinc-400 animate-pulse">Orchestrating hybrid multi-cloud query execution pipeline...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-lg border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-mono">
            ⚠️ Error: {error}
          </div>
        )}

        {/* 🤖 Scenario 1 Output Panel */}
        {activeTab === "nl" && nlResponse && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">⚙️ Compiled Semantic SQL Statement</h3>
              <pre className="font-mono text-xs text-cyan-400 bg-zinc-900/60 p-3 rounded border border-zinc-850 overflow-x-auto">
                {nlResponse.generated_sql || "-- No SQL generated"}
              </pre>
            </div>
            <div className="rounded-lg border border-cyan-850 bg-cyan-950/10 p-4">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">🤖 Conversational SOC Synthesis (Grounded)</h3>
              <div className="text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                {nlResponse.conversational_response || "No response synthesized."}
              </div>
            </div>
          </div>
        )}

        {/* 💾 Scenario 2 Output Panel */}
        {activeTab === "sql" && sqlResponse && (
          <div className="mt-6">
            <div className="rounded-lg border border-purple-850 bg-zinc-950 p-4">
              <div className="flex items-center justify-between mb-2 border-b border-zinc-850 pb-2">
                <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">💾 Raw JSON Developer Response</h3>
                <span className="text-[10px] bg-purple-900/30 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-mono">
                  {sqlResponse.length} records returned
                </span>
              </div>
              <pre className="font-mono text-xs text-zinc-300 bg-zinc-900/40 p-3 rounded max-h-[300px] overflow-y-auto overflow-x-auto">
                {JSON.stringify(sqlResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Static snapshot breakdown sections below */}
      <AiExecutiveSummarySection summary={snapshot.executiveSummary} />
      <AiRootCauseSection cards={snapshot.rootCauseAnalysis} />
      <AiCorrelationTimelineSection events={snapshot.correlationTimeline} />
      <AiFindingsSection findings={snapshot.findings} />
      <AiRecommendedActionsSection actions={snapshot.recommendedActions} />
      <AiConfidenceBreakdownSection metrics={snapshot.confidenceBreakdown} />
      <AiRelatedInvestigationsSection investigations={snapshot.relatedInvestigations} />
    </div>
  );
}
