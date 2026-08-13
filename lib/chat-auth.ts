import { UserStatus } from "@/prisma-client";
import { auth } from "../auth";

export async function activeChatUser() {
  const session = await auth();

  if (!session?.user || session.user.status !== UserStatus.ACTIVE) {
    return null;
  }

  return session.user;
}
