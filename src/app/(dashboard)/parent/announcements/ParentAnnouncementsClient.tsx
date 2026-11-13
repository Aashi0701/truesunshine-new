"use client";

import {
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  Clock3,
  Megaphone,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

type AnnouncementItem = {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  publishDate: string;
  expiryDate: string | null;
  className: string | null;
  isRead: boolean;
};

type Props = {
  announcements: AnnouncementItem[];
};

type Filter = "ALL" | "UNREAD" | "URGENT";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getPriorityStyle(priority: Priority) {
  switch (priority) {
    case "URGENT":
      return {
        label: "Urgent",
        badge: "bg-red-50 text-red-600",
        icon: "bg-red-50 text-red-600",
      };

    case "HIGH":
      return {
        label: "Important",
        badge: "bg-amber-50 text-amber-700",
        icon: "bg-amber-50 text-amber-700",
      };

    case "LOW":
      return {
        label: "Low priority",
        badge: "bg-slate-100 text-slate-600",
        icon: "bg-slate-100 text-slate-600",
      };

    default:
      return {
        label: "Normal",
        badge: "bg-[#EEF2FA] text-[#4B517D]",
        icon: "bg-[#EEF2FA] text-[#4B517D]",
      };
  }
}

export default function ParentAnnouncementsClient({ announcements }: Props) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selected, setSelected] = useState<AnnouncementItem | null>(null);

  const stats = useMemo(
    () => ({
      total: announcements.length,
      unread: announcements.filter((item) => !item.isRead).length,
      urgent: announcements.filter((item) => item.priority === "URGENT").length,
    }),
    [announcements],
  );

  const filtered = useMemo(() => {
    const items = announcements.filter((item) => {
      if (filter === "UNREAD") return !item.isRead;
      if (filter === "URGENT") return item.priority === "URGENT";
      return true;
    });

    return [...items].sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
    );
  }, [announcements, filter]);

  return (
    <>
      {/* Summary cards */}
      <section className="mt-6 grid grid-cols-2 gap-2.5">
        <div className="rounded-[18px] bg-[#4B517D] px-4 py-3 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-white/65">Announcements</p>
              <p className="mt-1 text-[24px] font-extrabold">{stats.total}</p>
              <p className="mt-0.5 text-[8px] text-white/60">
                Published notices
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
              <Megaphone className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[18px] border border-slate-100 bg-white px-4 py-3">
          <p className="text-[9px] text-slate-400">Unread</p>
          <p className="mt-1 text-[24px] font-extrabold text-[#4B517D]">
            {stats.unread}
          </p>
          <p className="mt-0.5 text-[8px] text-slate-400">Notices to review</p>
        </div>
      </section>

      {/* Filters */}
      <section className="mt-4 grid grid-cols-3 gap-2">
        {(
          [
            ["ALL", "All", stats.total],
            ["UNREAD", "Unread", stats.unread],
            ["URGENT", "Urgent", stats.urgent],
          ] as const
        ).map(([value, label, count]) => {
          const active = filter === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-[16px] px-2 py-2.5 text-[9px] font-bold transition active:scale-[0.98] ${
                active
                  ? "bg-[#4B517D] text-white"
                  : "border border-slate-100 bg-white text-slate-500"
              }`}
            >
              {label}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          );
        })}
      </section>

      {/* List header */}
      <div className="mt-6 flex items-end justify-between">
        <div>
          <h2 className="text-[17px] font-bold text-[#4B517D]">
            Recent Announcements
          </h2>
          <p className="mt-0.5 text-[9px] text-slate-400">
            {filtered.length} {filtered.length === 1 ? "notice" : "notices"}
          </p>
        </div>
      </div>

      {/* Announcement list */}
      <section className="mt-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-[22px] border border-slate-100 bg-white px-5 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#EEF2FA] text-[#4B517D]">
              <Bell className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#4B517D]">
              {filter === "UNREAD"
                ? "All caught up"
                : filter === "URGENT"
                  ? "No urgent announcements"
                  : "No announcements yet"}
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Published school notices will appear here.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const style = getPriorityStyle(item.priority);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className="w-full rounded-[22px] border border-slate-100 bg-white p-3.5 text-left shadow-[0_5px_18px_rgba(15,23,42,0.05)] transition active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] ${style.icon}`}
                  >
                    {item.priority === "URGENT" ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : (
                      <Megaphone className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-[13px] font-extrabold text-slate-900">
                        {item.title}
                      </h3>

                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    </div>

                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
                      {item.description}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-[8px] font-bold ${style.badge}`}
                      >
                        {style.label}
                      </span>

                      {!item.isRead && (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-700">
                          New
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-[9px] text-slate-400">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(item.publishDate)}

                      {item.className && (
                        <>
                          <span>·</span>
                          <Users className="h-3 w-3" />
                          <span>{item.className}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </section>

      {/* Announcement details */}
      {selected && (
        <>
          <button
            type="button"
            aria-label="Close announcement details"
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[80] bg-black/25 backdrop-blur-[2px]"
          />

          <section className="fixed bottom-0 left-1/2 z-[90] max-h-[82dvh] w-full max-w-[430px] -translate-x-1/2 overflow-y-auto rounded-t-[28px] bg-white px-5 pb-8 pt-3 shadow-[0_-10px_40px_rgba(15,23,42,0.18)]">
            <div className="mx-auto h-1 w-10 rounded-full bg-slate-200" />

            <div className="mt-4 flex items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] ${getPriorityStyle(selected.priority).icon}`}
              >
                <Megaphone className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${getPriorityStyle(selected.priority).badge}`}
                >
                  {getPriorityStyle(selected.priority).label}
                </span>

                <h3 className="mt-2 text-[17px] font-extrabold text-slate-900">
                  {selected.title}
                </h3>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelected(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-[20px] bg-[#F7F8FA] p-4">
              <p className="whitespace-pre-wrap break-words text-[12px] leading-6 text-slate-600">
                {selected.description}
              </p>
            </div>

            <div className="mt-3 space-y-3 rounded-[18px] border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-[#4B517D]" />
                <div>
                  <p className="text-[9px] text-slate-400">Published on</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-700">
                    {formatDate(selected.publishDate)}
                  </p>
                </div>
              </div>

              {selected.expiryDate && (
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-[#4B517D]" />
                  <div>
                    <p className="text-[9px] text-slate-400">Expires on</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-700">
                      {formatDate(selected.expiryDate)}
                    </p>
                  </div>
                </div>
              )}

              {selected.className && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-[#4B517D]" />
                  <div>
                    <p className="text-[9px] text-slate-400">Target class</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-700">
                      {selected.className}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-[16px] bg-emerald-50 px-3.5 py-3 text-emerald-700">
              {selected.isRead ? (
                <CheckCheck className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}

              <p className="text-[10px] font-semibold">
                {selected.isRead
                  ? "You have read this announcement."
                  : "Open and review this announcement."}
              </p>
            </div>
          </section>
        </>
      )}
    </>
  );
}
