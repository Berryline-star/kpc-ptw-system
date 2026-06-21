"use client";

import { useState, useTransition } from "react";
import { postPermitComment } from "@/lib/actions/comments";
import { formatRelativeTime } from "@/lib/format";

interface ActivityItem {
  id: string;
  message: string;
  type: string;
  createdAt: Date;
  author: { id: string; name: string } | null;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ActivityLogThread({
  permitId,
  entries,
  currentUserId,
}: {
  permitId: string;
  entries: ActivityItem[];
  currentUserId: string;
}) {
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [localEntries, setLocalEntries] = useState(entries);

  function handleSend() {
    const trimmed = comment.trim();
    if (!trimmed) return;

    const optimisticEntry: ActivityItem = {
      id: `optimistic-${Date.now()}`,
      message: trimmed,
      type: "COMMENT",
      createdAt: new Date(),
      author: { id: currentUserId, name: "You" },
    };
    setLocalEntries((prev) => [...prev, optimisticEntry]);
    setComment("");

    startTransition(async () => {
      await postPermitComment(permitId, trimmed);
    });
  }

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-label-lg font-bold text-primary">
        <span className="material-symbols-outlined">forum</span>
        ACTIVITY LOG
      </h2>
      <div className="max-h-60 space-y-4 overflow-y-auto rounded-xl border border-outline-variant/20 bg-surface-container-low p-stack-md">
        {localEntries.length === 0 && (
          <p className="text-center text-body-sm text-on-surface-variant">
            No activity yet.
          </p>
        )}
        {localEntries.map((entry) => {
          if (entry.type !== "COMMENT") {
            return (
              <div key={entry.id} className="flex items-center gap-2 py-2">
                <div className="h-px flex-1 bg-outline-variant" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {entry.message}
                </span>
                <div className="h-px flex-1 bg-outline-variant" />
              </div>
            );
          }

          const isMe = entry.author?.id === currentUserId;
          return (
            <div
              key={entry.id}
              className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                  isMe ? "bg-secondary" : "bg-primary"
                }`}
              >
                {isMe ? "YOU" : initials(entry.author?.name ?? "?")}
              </div>
              <div
                className={`flex-1 rounded-tr-xl rounded-bl-xl rounded-br-xl p-3 shadow-sm ${
                  isMe
                    ? "bg-primary text-on-primary"
                    : "border border-outline-variant/30 bg-white"
                }`}
              >
                <div className="mb-1 flex justify-between">
                  <span className="text-[11px] font-bold">
                    {isMe ? "Me" : entry.author?.name}
                  </span>
                  <span
                    className={`text-[10px] ${isMe ? "opacity-70" : "text-on-surface-variant"}`}
                  >
                    {formatRelativeTime(entry.createdAt)}
                  </span>
                </div>
                <p className="text-body-sm">{entry.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-2 rounded-full border border-outline-variant bg-white px-4 py-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isPending}
          className="flex-1 border-none bg-transparent text-label-md focus:outline-none focus:ring-0"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !comment.trim()}
          aria-label="Send comment"
          className="text-primary transition-transform hover:scale-110 disabled:opacity-40"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </section>
  );
}
