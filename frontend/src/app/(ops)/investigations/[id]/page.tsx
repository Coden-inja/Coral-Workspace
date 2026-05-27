import Link from "next/link";

import { Panel } from "@/components/shared/panel";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getInvestigationById } from "@/lib/mock-data";

type InvestigationDetailPageProps = {
  params?: {
    id?: string;
  };
};

export default function InvestigationDetailPage({ params }: InvestigationDetailPageProps) {
  const investigation = getInvestigationById(params?.id);

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Investigation Detail"
        title={investigation.title}
        description={investigation.summary}
        actions={
          <Link
            href={`/investigations/${investigation.id}/timeline`}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            Open Timeline
          </Link>
        }
      />

      <Panel title="Incident Context" description={`Incident ${investigation.id}`} padding="md">
        <div className="grid gap-2 sm:grid-cols-4">
          <StatusBadge label={investigation.overallStatus} tone={investigation.overallTone} size="md" />
          <StatusBadge label={`Start ${investigation.startedAt}`} tone="neutral" size="sm" />
          <StatusBadge label={`Updated ${investigation.updatedAt}`} tone="neutral" size="sm" />
          <StatusBadge label={`${investigation.timeline.length} timeline steps`} tone="info" size="sm" />
        </div>
      </Panel>
    </div>
  );
}

