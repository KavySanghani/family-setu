import React from 'react';
import { useNotifications, useMarkRead, type Notification } from '../api/notificationApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Bell, Check } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { data: notifications, isLoading, error } = useNotifications();
  const { mutate: markRead } = useMarkRead();

  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (error) return <Alert variant="destructive">Failed to load notifications.</Alert>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">Stay updated on your family's applications and benefits.</p>
      </div>

      {(!notifications || notifications.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {notifications?.map((n: Notification) => (
          <Card key={n.id} className={n.read_at ? 'opacity-60' : ''}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.read_at && <div className="w-2 h-2 rounded-full bg-primary" />}
                    <p className="font-medium text-sm">{n.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.read_at && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
