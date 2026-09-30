// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceSubmissionStatus, ResourceType, Role, UserStatus } from "@/prisma-client";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  user: { findUnique: vi.fn() },
  submission: { findUnique: vi.fn(), updateMany: vi.fn() },
  resource: { findFirst: vi.fn(), create: vi.fn() },
  transaction: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

vi.mock("../../../lib/guards", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("../../../lib/prisma", () => ({
  prisma: {
    user: mocks.user,
    resourceSubmission: mocks.submission,
    $transaction: mocks.transaction,
  },
}));
vi.mock("@vercel/blob", () => ({ put: mocks.put, del: mocks.del }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));

import {
  approveResourceSubmission,
  rejectResourceSubmission,
} from "../../../app/(protected)/admin/bookshelf/actions";

const pdfUrl = "https://test.public.blob.vercel-storage.com/book.pdf";
const coverUrl = "https://test.public.blob.vercel-storage.com/cover.jpg";
const submission = {
  id: "submission-id",
  title: "A recommended book",
  author: "An author",
  type: ResourceType.BOOK,
  recommendationReason: "A useful introduction to distributed systems.",
  resourceLink: "https://example.com/book",
  buyLink: "https://example.com/buy",
  imageUrl: "https://example.com/cover.jpg",
  categoryId: "category-id",
  category: { slug: "system-design" },
  submittedById: "member-id",
  status: ResourceSubmissionStatus.PENDING,
};

function approvalForm() {
  const form = new FormData();
  form.set("submissionId", submission.id);
  form.set("pdf", new File(["%PDF-1.4"], "book.pdf", { type: "application/pdf" }));
  return form;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", "test-token");
  mocks.requireAdmin.mockResolvedValue({ id: "admin-id" });
  mocks.user.findUnique.mockResolvedValue({
    id: "admin-id",
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
  });
  mocks.submission.findUnique.mockResolvedValue(submission);
  mocks.submission.updateMany.mockResolvedValue({ count: 1 });
  mocks.resource.findFirst.mockResolvedValue(null);
  mocks.transaction.mockImplementation((callback) =>
    callback({ resourceSubmission: mocks.submission, resource: mocks.resource }),
  );
  mocks.put.mockResolvedValue({ url: pdfUrl });
  mocks.del.mockResolvedValue(undefined);
});

afterEach(() => vi.unstubAllEnvs());

describe("bookshelf approval", () => {
  it("requires a PDF without uploading or changing the submission", async () => {
    const form = approvalForm();
    form.delete("pdf");
    await expect(approveResourceSubmission(form)).rejects.toThrow("error=missingpdf");
    expect(mocks.put).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects non-PDF files before uploading", async () => {
    const form = approvalForm();
    form.set("pdf", new File(["text"], "book.txt", { type: "text/plain" }));
    await expect(approveResourceSubmission(form)).rejects.toThrow("error=pdf");
    expect(mocks.put).not.toHaveBeenCalled();
  });

  it("requires configured storage", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    await expect(approveResourceSubmission(approvalForm())).rejects.toThrow("error=storage");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it.each([
    { role: Role.MEMBER, status: UserStatus.ACTIVE },
    { role: Role.ADMIN, status: UserStatus.SUSPENDED },
  ])("checks current database permissions for $role/$status", async (user) => {
    mocks.user.findUnique.mockResolvedValue({ id: "admin-id", ...user });
    await expect(approveResourceSubmission(approvalForm())).rejects.toThrow("/dashboard");
    expect(mocks.put).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it.each([ResourceType.BOOK, ResourceType.RESEARCH_PAPER])(
    "publishes the uploaded %s PDF with submitter attribution, not external links",
    async (type) => {
      mocks.submission.findUnique.mockResolvedValue({ ...submission, type });
      const form = approvalForm();
      form.set("cover", new File(["jpeg"], "cover.jpg", { type: "image/jpeg" }));
      mocks.put.mockResolvedValueOnce({ url: pdfUrl }).mockResolvedValueOnce({ url: coverUrl });

      await expect(approveResourceSubmission(form)).rejects.toThrow("success=approved");
      expect(mocks.resource.create).toHaveBeenCalledWith({
        data: {
          title: submission.title,
          author: submission.author,
          type,
          recommendationReason: submission.recommendationReason,
          categoryId: submission.categoryId,
          recommendedById: submission.submittedById,
          pdfUrl,
          pdfSizeBytes: 8,
          imageUrl: coverUrl,
        },
      });
      expect(mocks.submission.updateMany).toHaveBeenCalledWith({
        where: { id: submission.id, status: ResourceSubmissionStatus.PENDING },
        data: {
          status: ResourceSubmissionStatus.APPROVED,
          reviewedById: "admin-id",
          reviewedAt: expect.any(Date),
        },
      });
      expect(mocks.del).not.toHaveBeenCalled();
    },
  );

  it("cleans up the PDF when cover upload fails", async () => {
    const form = approvalForm();
    form.set("cover", new File(["jpeg"], "cover.jpg", { type: "image/jpeg" }));
    mocks.put.mockResolvedValueOnce({ url: pdfUrl }).mockRejectedValueOnce(new Error("storage"));
    await expect(approveResourceSubmission(form)).rejects.toThrow("storage");
    expect(mocks.del).toHaveBeenCalledWith(pdfUrl);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("cleans up both uploads if resource creation fails", async () => {
    const form = approvalForm();
    form.set("cover", new File(["jpeg"], "cover.jpg", { type: "image/jpeg" }));
    mocks.put.mockResolvedValueOnce({ url: pdfUrl }).mockResolvedValueOnce({ url: coverUrl });
    mocks.resource.create.mockRejectedValue(new Error("database failure"));
    await expect(approveResourceSubmission(form)).rejects.toThrow("database failure");
    expect(mocks.del).toHaveBeenCalledWith(pdfUrl);
    expect(mocks.del).toHaveBeenCalledWith(coverUrl);
  });

  it("does not publish a duplicate resource", async () => {
    mocks.resource.findFirst.mockResolvedValue({ id: "existing-id" });
    await expect(approveResourceSubmission(approvalForm())).rejects.toThrow("error=duplicate");
    expect(mocks.resource.create).not.toHaveBeenCalled();
    expect(mocks.submission.updateMany).not.toHaveBeenCalled();
    expect(mocks.del).toHaveBeenCalledWith(pdfUrl);
  });

  it("does not publish when another review has already claimed the submission", async () => {
    mocks.submission.updateMany.mockResolvedValue({ count: 0 });
    await expect(approveResourceSubmission(approvalForm())).rejects.toThrow("error=missing");
    expect(mocks.resource.create).not.toHaveBeenCalled();
    expect(mocks.del).toHaveBeenCalledWith(pdfUrl);
  });

  it("rejects without uploading or publishing", async () => {
    await expect(rejectResourceSubmission(approvalForm())).rejects.toThrow("success=rejected");
    expect(mocks.submission.updateMany).toHaveBeenCalledWith({
      where: { id: submission.id, status: ResourceSubmissionStatus.PENDING },
      data: {
        status: ResourceSubmissionStatus.REJECTED,
        reviewedById: "admin-id",
        reviewedAt: expect.any(Date),
      },
    });
    expect(mocks.put).not.toHaveBeenCalled();
    expect(mocks.resource.create).not.toHaveBeenCalled();
  });
});
