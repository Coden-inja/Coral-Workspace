import { AiAnalysisDashboard } from "@/components/ai-analysis/ai-analysis-dashboard";
import { getAiAnalysisSnapshot } from "@/services/api";

export default async function AiAnalysisPage() {
  const snapshot = await getAiAnalysisSnapshot();
  return <AiAnalysisDashboard snapshot={snapshot} />;
}
