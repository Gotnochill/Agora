import { ApplicationStatus, Role, UserStatus } from "@prisma/client";
import { prisma } from "./prisma";

function getAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function syncUserAccess(userId: string, email?: string | null) {
  const adminEmails = getAdminEmails();
  const shouldBeAdmin = Boolean(email && adminEmails.has(email.toLowerCase()));

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  });

  if (!user) {
    return null;
  }

  if (shouldBeAdmin && (user.role !== Role.ADMIN || user.status !== UserStatus.ACTIVE)) {
    return prisma.user.update({
      where: { id: userId },
      data: { role: Role.ADMIN, status: UserStatus.ACTIVE },
      select: { id: true, role: true, status: true },
    });
  }

  return { id: userId, role: user.role, status: user.status };
}

export async function ensureRegistrationRecords(userId: string, email?: string | null) {
  const access = await syncUserAccess(userId, email);

  await prisma.profile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const latestApplication = await prisma.application.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!latestApplication && access?.role !== Role.ADMIN) {
    await prisma.application.create({
      data: { userId, status: ApplicationStatus.DRAFT },
    });
  }
}
