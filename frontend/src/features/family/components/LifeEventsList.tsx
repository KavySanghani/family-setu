import React from 'react';
import { useLifeEvents, type LifeEvent } from '../api/familyApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';

interface Props { familyId: string; }

export const LifeEventsList: React.FC<Props> = ({ familyId }) => {
  const { data: events, isLoading, error } = useLifeEvents(familyId);

  if (isLoading) return <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>;
  if (error) return <Alert variant="destructive">Failed to load life events.</Alert>;
  if (!events || events.length === 0) {
    return (
      <Card className="mb-6 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No life events recorded.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader><CardTitle>Life Events</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((e: LifeEvent) => (
            <div key={e.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary/30">
              <div className="space-y-1">
                <p className="font-medium">{e.event_type}</p>
                {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
              </div>
              <span className="text-sm font-semibold text-primary whitespace-nowrap ml-4">
                {new Date(e.event_date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
