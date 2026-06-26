/* eslint-disable @next/next/no-img-element */

import { notFound } from "next/navigation";
import { formatEventDetailDate, toISTInputValue } from "../../../../../lib/events";
import { requireAdmin } from "../../../../../lib/guards";
import { prisma } from "../../../../../lib/prisma";
import CompressingImageInput from "../../../../compressing-image-input";
import { deleteEvent, updateEvent } from "../actions";

const errors: Record<string, string> = {
  invalid: "Check the event fields and times.",
  image: "Upload a JPG, PNG, WebP, or SVG event image under 2MB.",
  storage: "Event image storage is not configured yet. Add BLOB_READ_WRITE_TOKEN.",
};

export default async function AdminEventPage({
  params,
  searchParams,
}: Readonly<{ params: { id: string }; searchParams?: { error?: string } }>) {
  await requireAdmin();
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { _count: { select: { rsvps: true } } },
  });

  if (!event) {
    notFound();
  }

  return (
    <main className="app-shell wide-card workspace-shell">
      <section className="app-card workspace-card">
        <p className="section-label">Admin</p>
        <h1>{event.title}</h1>
        <p>
          {formatEventDetailDate(event.startsAt, event.endsAt)} · {event._count.rsvps} going
        </p>
        {searchParams?.error ? (
          <div className="form-message error">{errors[searchParams.error] ?? errors.invalid}</div>
        ) : null}

        <div className="badge-admin-layout">
          <form action={updateEvent} className="stacked-form compact-form">
            <input type="hidden" name="eventId" value={event.id} />

            {event.imageUrl ? (
              <img className="badge-group-image" src={event.imageUrl} alt="" />
            ) : (
              <span className="badge-group-image badge-image-fallback">Event</span>
            )}

            <label htmlFor="title">Title</label>
            <input id="title" name="title" defaultValue={event.title} required />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={event.description}
              required
            />

            <label htmlFor="location">Location</label>
            <input id="location" name="location" defaultValue={event.location} required />

            <label htmlFor="startsAt">Starts at (IST)</label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={toISTInputValue(event.startsAt)}
              required
            />

            <label htmlFor="endsAt">Ends at (IST)</label>
            <input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              defaultValue={event.endsAt ? toISTInputValue(event.endsAt) : ""}
            />

            <label htmlFor="published">
              <input
                id="published"
                name="published"
                type="checkbox"
                defaultChecked={event.published}
              />
              Published
            </label>

            <label htmlFor="image">Event image</label>
            <CompressingImageInput id="image" name="image" />

            <button className="button" type="submit">
              Save event
            </button>
          </form>

          <section className="member-panel">
            <p className="section-label">Danger zone</p>
            <h2>Delete event</h2>
            <p>Deletes this event and all RSVPs.</p>
            <form action={deleteEvent}>
              <input type="hidden" name="eventId" value={event.id} />
              <button className="secondary-button" type="submit">
                Delete event
              </button>
            </form>
            <a className="text-link" href="/admin/events">
              Back to events
            </a>
          </section>
        </div>
      </section>
    </main>
  );
}
