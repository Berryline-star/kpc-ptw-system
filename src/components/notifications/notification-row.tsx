"use client";

import { useTransition } from "react";
import Link from "next/link";
import { markNotificationRead } from "@/lib/actions/notifications";
import { NOTIFICATION_TYPE_META } from "@/lib/queries/notifications";
import type { NotificationType } from "@prisma/client";

interface NotificationRowProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedPermit: { id: string; permitNumber: string } | null;
}

export function NotificationRow({
  id,
  type,
  title,
  message,
  isRead,
  createdAt,
  relatedPermit,
}: NotificationRowProps) {
  const [isPending, startTransition] = useTransition();
  const meta = NOTIFICATION_TYPE_META[type];

  const content = (
    <div
      className={`flex gap-stack-md border-b border-outline-variant p-stack-md transition-colors ${
        isRead ? "bg-surface" : "bg-primary/5"
      }`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${meta.badgeClass}`}
      >
        <span className="material-symbols-outlined text-[20px]">
          {meta.icon}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-label-lg font-bold text-on-surface">{title}</p>
          {!isRead && (
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-secondary" />
          )}
        </div>
        <p className="mb-1 text-body-sm text-on-surface-variant">{message}</p>
        <div className="flex items-center gap-stack-sm text-label-sm text-on-surface-variant opacity-70">
          <span>{createdAt}</span>
          {relatedPermit && (
            <>
              <span>&middot;</span>
              <span>#{relatedPermit.permitNumber}</span>
            </>
          )}
        </div>
      </div>

      {!isRead && (
        <button
          type="button"
          disabled={isPending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            startTransition(() => {
              markNotificationRead(id);
            });
          }}
          className="h-fit flex-shrink-0 text-label-sm text-primary hover:underline disabled:opacity-50"
        >
          Mark read
        </button>
      )}
    </div>
  );

  if (relatedPermit) {
    return (
      <Link href={`/permits/${relatedPermit.id}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
