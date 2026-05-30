import type { UsersPageSnapshot } from "@/contracts/users";
import { getMockUsersPageSnapshot } from "@/services/mock/users";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getUsersPageSnapshot(): Promise<UsersPageSnapshot> {
  await delay(200);
  return getMockUsersPageSnapshot();
}
