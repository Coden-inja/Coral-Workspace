import { UsersPageView } from "@/components/users/users-page-view";
import { getUsersPageSnapshot } from "@/services/api";

export default async function UsersPage() {
  const snapshot = await getUsersPageSnapshot();
  return <UsersPageView snapshot={snapshot} />;
}
