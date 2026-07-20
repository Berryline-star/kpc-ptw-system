import { requireUser } from "@/lib/session";
import { getNotificationsForUser } from "@/lib/queries/notifications";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { NotificationRow } from "@/components/notifications/notification-row";

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotificationsForUser(user.id);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-screen-md p-margin-mobile pb-24 md:p-margin-desktop">
      <section className="mb-stack-lg flex items-start justify-between gap-stack-md">
        <div>
          <h2 className="mb-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
            Notifications
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up."}
          </p>
        </div>

        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="whitespace-nowrap text-label-md text-primary hover:underline"
            >
              Mark all as read
            </button>
          </form>
        )}
      </section>

      {notifications.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">
          No notifications yet.
        </p>
      ) : (
        <div className="border border-outline-variant bg-surface">
          {notifications.map((n) => (
            <NotificationRow
              key={n.id}
              id={n.id}
              type={n.type}
              title={n.title}
              message={n.message}
              isRead={n.isRead}
              createdAt={formatRelativeTime(n.createdAt)}
              relatedPermit={n.relatedPermit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
