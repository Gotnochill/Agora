import type { NotificationType } from "@prisma/client";
import { requireActiveUser } from "../../lib/guards";
import {
  listNotifications,
  relativeTimeFromNow,
  unreadNotificationCount,
} from "../../lib/notifications";
import MarkSeen from "./mark-seen";

export const dynamic = "force-dynamic";

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  PRACTICE_SOLVED: "✅",
  RANK_UP: "⬆️",
  BADGE_EARNED: "🏅",
  CONTEST_FINISHED: "🏆",
};

export default async function NotificationsPage() {
  const user = await requireActiveUser();
  const [notifications, unreadCount] = await Promise.all([
    listNotifications(user.id),
    unreadNotificationCount(user.id),
  ]);
  const now = new Date();

  return (
    <main className="app-shell wide-card workspace-shell">
      <MarkSeen hasUnread={unreadCount > 0} />
      <section className="app-card workspace-card">
        <p className="section-label">Community</p>
        <h1>Notifications</h1>
        <p className="notifications-intro">
          See what fellow members are achieving — new solves, rank-ups, badges, and contests. Get
          inspired to level up too.
        </p>

        {notifications.length > 0 ? (
          <ul className="notification-list">
            {notifications.map((notification) => {
              const body = (
                <>
                  <span className="notification-icon" aria-hidden="true">
                    {NOTIFICATION_ICONS[notification.type]}
                  </span>
                  <span className="notification-body">
                    <span className="notification-message">{notification.message}</span>
                    <time
                      className="notification-time"
                      dateTime={notification.createdAt.toISOString()}
                    >
                      {relativeTimeFromNow(notification.createdAt, now)}
                    </time>
                  </span>
                </>
              );

              return (
                <li className="notification-item" key={notification.id}>
                  {notification.link ? (
                    <a className="notification-row" href={notification.link}>
                      {body}
                    </a>
                  ) : (
                    <div className="notification-row">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="form-message">
            No notifications yet. Be the first to solve a problem or climb the ranks!
          </div>
        )}
      </section>
    </main>
  );
}
