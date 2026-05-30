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
  return (
    <div className="space-y-6">
      <SectionHeader
        variant="page"
        title="AI Operational Intelligence"
        description="Cross-source reasoning across GitHub, Slack, Sentry and investigations."
      />

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
