import { Panel } from "@/components/shared/panel";
import { SectionHeader } from "@/components/shared/section-header";

export default function WorkspacesPage() {
  return (
    <div className="space-y-3">
      <SectionHeader
        eyebrow="Workspace Administration"
        title="Workspaces"
        description="Operational workspace boundaries for enterprise investigations."
      />
      <Panel title="Workspace Inventory" description="Workspace metadata and ownership." padding="md">
        <p className="text-sm text-zinc-400">Mock workspaces route for connected workflow navigation.</p>
      </Panel>
    </div>
  );
}

