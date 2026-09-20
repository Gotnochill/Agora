import { ResourceSubmissionStatus } from "@/prisma-client";
import PdfCoverCapture from "../../../../components/bookshelf/pdf-cover-capture";
import { formatBytes } from "../../../../lib/bookshelf/format";
import { requireAdmin } from "../../../../lib/guards";
import { prisma } from "../../../../lib/prisma";
import { approveResourceSubmission, deleteResource, rejectResourceSubmission } from "./actions";

const errorMessages: Record<string, string> = {
  duplicate: "That resource is already published.",
  missing: "That submission is no longer waiting for review.",
  missingpdf: "Choose a PDF before approving this recommendation.",
  pdf: "Choose a PDF file up to 50MB.",
  cover: "The cover must be a JPEG image up to 5MB.",
  storage: "PDF storage is not configured.",
};

export default async function AdminBookshelfPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdmin();
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true, slug: true } } },
  });
  const submissions = await prisma.resourceSubmission.findMany({
    where: { status: ResourceSubmissionStatus.PENDING },
    orderBy: { createdAt: "asc" },
    include: {
      category: { select: { name: true } },
      submittedBy: { select: { name: true, email: true } },
    },
  });

  return (
    <main className="app-shell workspace-shell bookshelf-submission-admin-page">
      <section className="app-card workspace-card">
        <p className="section-label">Admin</p>
        <h1>Bookshelf</h1>
        <p>Create and manage bookshelf resources, including full PDFs for the in-app reader.</p>

        <a className="button" href="/admin/bookshelf/new">
          Create resource
        </a>

        <div className="member-badge-admin-list">
          {resources.length === 0 ? (
            <p>No resources yet. Create the first one.</p>
          ) : (
            resources.map((resource) => (
              <article className="member-badge-admin-row" key={resource.id}>
                <div>
                  <strong>{resource.title}</strong>
                  <small>
                    {resource.category.name} · {resource.type.replace("_", " ")}
                    {resource.pdfUrl
                      ? ` · PDF ${formatBytes(resource.pdfSizeBytes)}`
                      : " · PDF missing"}
                  </small>
                </div>
                <a className="secondary-button" href={`/admin/bookshelf/${resource.id}`}>
                  Manage
                </a>
                <form action={deleteResource}>
                  <input type="hidden" name="resourceId" value={resource.id} />
                  <button className="secondary-button" type="submit">
                    Delete
                  </button>
                </form>
              </article>
            ))
          )}
        </div>

        <h2>Pending recommendations</h2>

        {searchParams?.success ? (
          <div className="form-message" role="status">
            Submission {searchParams.success}.
          </div>
        ) : null}
        {searchParams?.error ? (
          <div className="form-message error" role="alert">
            {errorMessages[searchParams.error] ?? errorMessages.missing}
          </div>
        ) : null}

        <div className="resource-submission-admin-list">
          {submissions.length ? (
            submissions.map((submission) => (
              <article className="resource-submission-admin-row" key={submission.id}>
                <div className="resource-submission-admin-heading">
                  <div>
                    <span className="resource-type-badge">{submission.type.replace("_", " ")}</span>
                    <h2>{submission.title}</h2>
                    <p>
                      by {submission.author} · {submission.category.name}
                    </p>
                  </div>
                  <small>
                    Submitted by {submission.submittedBy.name ?? submission.submittedBy.email}
                  </small>
                </div>

                <blockquote>{submission.recommendationReason}</blockquote>

                <div className="auth-actions-list">
                  <a
                    className="secondary-button"
                    href={submission.resourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Check resource
                  </a>
                  {submission.buyLink ? (
                    <a
                      className="text-link"
                      href={submission.buyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Check buy link
                    </a>
                  ) : null}
                </div>

                <div className="resource-submission-admin-actions">
                  <form action={approveResourceSubmission} className="stacked-form">
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <label htmlFor={`pdf-${submission.id}`}>PDF file</label>
                    <input
                      id={`pdf-${submission.id}`}
                      name="pdf"
                      type="file"
                      accept="application/pdf,.pdf"
                      required
                    />
                    <PdfCoverCapture pdfInputId={`pdf-${submission.id}`} />
                    <button className="button" type="submit">
                      Approve and publish
                    </button>
                  </form>
                  <form action={rejectResourceSubmission}>
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <button className="secondary-button" type="submit">
                      Reject
                    </button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <div className="form-message">No submissions are waiting for review.</div>
          )}
        </div>
      </section>
    </main>
  );
}
