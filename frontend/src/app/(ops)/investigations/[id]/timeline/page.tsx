import { InvestigationTimeline } from "@/components/investigations/timeline/investigation-timeline";
import { InvestigationStoreProvider } from "@/components/investigations/state/investigation-store";
import { Panel } from "@/components/shared/panel";
import { getInvestigationById } from "@/services/api";

type TimelinePageProps = {
  params?: {
    id?: string;
  };
};

export default async function TimelinePage({ params }: TimelinePageProps) {
  const loadResult = await getInvestigationById(params?.id)
    .then((data) => ({ investigation: data, error: null as string | null }))
    .catch((error: unknown) => ({
      investigation: null,
      error: error instanceof Error ? error.message : "Failed to load investigation.",
    }));

  if (!loadResult.investigation) {
    return (
      <Panel title="Graph query failure state" description="Unable to load investigation graph data." padding="md">
        <p className="text-sm text-zinc-300">{loadResult.error ?? "Unknown investigation loading error."}</p>
      </Panel>
    );
  }

  return (
    <InvestigationStoreProvider investigation={loadResult.investigation}>
      <InvestigationTimeline investigation={loadResult.investigation} />
    </InvestigationStoreProvider>
  );
}

