import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useGetRecentNotifications } from '../hooks/useQueries';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { timeAgo } from '../utils/timeAgo';

const STORAGE_KEY = 'notification_last_read';

export default function NotificationBell() {
  const { data: notifications = [] } = useGetRecentNotifications();
  const [open, setOpen] = useState(false);
  const lastReadRef = useRef<number>(
    parseInt(sessionStorage.getItem(STORAGE_KEY) ?? '0', 10)
  );

  const unreadCount = notifications.filter(
    (n) => Number(n.timestamp) > lastReadRef.current
  ).length;

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && notifications.length > 0) {
      const latest = Math.max(...notifications.map((n) => Number(n.timestamp)));
      lastReadRef.current = latest;
      sessionStorage.setItem(STORAGE_KEY, String(latest));
    }
  };

  const handleMarkAllRead = () => {
    if (notifications.length > 0) {
      const latest = Math.max(...notifications.map((n) => Number(n.timestamp)));
      lastReadRef.current = latest;
      sessionStorage.setItem(STORAGE_KEY, String(latest));
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification, idx) => (
                <div
                  key={idx}
                  className={`p-4 text-sm ${
                    Number(notification.timestamp) > lastReadRef.current
                      ? 'bg-primary/5'
                      : ''
                  }`}
                >
                  <p className="text-foreground font-medium">{notification.message}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {timeAgo(notification.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
