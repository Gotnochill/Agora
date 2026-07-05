"use server";

import { requireActiveUser } from "../../lib/guards";
import { markNotificationsSeen } from "../../lib/notifications";

export async function markNotificationsSeenAction() {
  const user = await requireActiveUser();
  await markNotificationsSeen(user.id);
}
