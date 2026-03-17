"use client";

import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BellIcon,
  CheckCircle2Icon,
  XCircleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  brandId: string;
  notifications: Notification[];
  unreadCount: number;
}

const typeIcons: Record<string, React.ReactNode> = {
  scan_completed: <CheckCircle2Icon className="size-4 text-green-500" />,
  scan_failed: <XCircleIcon className="size-4 text-red-500" />,
  score_up: <TrendingUpIcon className="size-4 text-green-500" />,
  score_down: <TrendingDownIcon className="size-4 text-orange-500" />,
};

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "az önce";
  if (minutes < 60) return `${minutes}dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}sa önce`;
  const days = Math.floor(hours / 24);
  return `${days}g önce`;
}

export function NotificationBell({
  brandId,
  notifications,
  unreadCount,
}: NotificationBellProps) {
  const [isPending, startTransition] = useTransition();

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead(brandId);
    });
  }

  function handleMarkRead(notificationId: string) {
    startTransition(async () => {
      await markNotificationRead(brandId, notificationId);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
        <BellIcon className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Bildirimler</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              className="px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              onClick={handleMarkAllRead}
              disabled={isPending}
            >
              Tümünü okundu işaretle
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            Henüz bildirim yok
          </div>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex items-start gap-2.5 px-2 py-2"
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <div className="mt-0.5 shrink-0">
                {typeIcons[n.type] ?? (
                  <BellIcon className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${!n.read ? "font-semibold" : "font-medium text-muted-foreground"}`}
                  >
                    {n.title}
                  </span>
                  {!n.read && (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{n.message}</p>
                <p className="text-[10px] text-muted-foreground/60">
                  {formatTimeAgo(new Date(n.createdAt))}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
