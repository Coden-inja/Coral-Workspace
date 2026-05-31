import { SettingsPageView } from "@/components/settings/settings-page-view";
import { getSettingsPageSnapshot } from "@/services/api";

export default async function SettingsPage() {
  const snapshot = await getSettingsPageSnapshot();
  return <SettingsPageView snapshot={snapshot} />;
}
