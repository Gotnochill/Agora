import { ApplicationStatus, UserStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { ensureRegistrationRecords } from "../../../lib/access";
import { prisma } from "../../../lib/prisma";
import { submitApplication } from "./actions";

export default async function ApplyPage({
  searchParams,
}: Readonly<{
  searchParams?: { error?: string; submitted?: string };
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/join");
  }

  if (session.user.status === UserStatus.ACTIVE) {
    redirect("/dashboard");
  }

  await ensureRegistrationRecords(session.user.id, session.user.email);

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
  const application = await prisma.application.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const isSubmitted = application?.status === ApplicationStatus.SUBMITTED;
  const isRejected = session.user.status === UserStatus.REJECTED;

  return (
    <main className="app-shell">
      <section className="app-card">
        <p className="section-label">ShardUp application</p>
        <h1>{isRejected ? "Application not approved" : "Complete your application"}</h1>
        {searchParams?.error ? (
          <p className="form-message error">Please fill in the required fields.</p>
        ) : null}
        {searchParams?.submitted ? (
          <p className="form-message">Application submitted. We will review it soon.</p>
        ) : null}
        {isRejected ? (
          <p>
            Your latest application was not approved. Reach out to the ShardUp
            team if you think this needs another look.
          </p>
        ) : isSubmitted ? (
          <p>
            Your application is pending review. You can update and resubmit the
            form below if anything has changed.
          </p>
        ) : (
          <p>
            Tell us a little about yourself. Approved members will get access to
            the community dashboard and future ShardUp features.
          </p>
        )}
        {!isRejected ? (
          <form action={submitApplication} className="stacked-form">
            <label>
              Display name
              <input
                name="displayName"
                required
                defaultValue={profile?.displayName ?? session.user.name ?? ""}
              />
            </label>
            <label>
              Batch
              <input name="batch" required defaultValue={profile?.batch ?? ""} />
            </label>
            <label>
              Branch
              <input name="branch" required defaultValue={profile?.branch ?? ""} />
            </label>
            <label>
              What do you want to build or improve through ShardUp?
              <textarea name="goals" required defaultValue={application?.goals ?? ""} />
            </label>
            <label>
              Relevant experience or projects
              <textarea name="experience" defaultValue={application?.experience ?? ""} />
            </label>
            <button className="button" type="submit">
              Submit application
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}
