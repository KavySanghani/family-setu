import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { useRecordLifeEvent } from '../api/familyApi';

const schema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props { familyId: string; onSuccess?: () => void; }

export const RecordLifeEventForm: React.FC<Props> = ({ familyId, onSuccess }) => {
  const { mutateAsync, isPending, error } = useRecordLifeEvent();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await mutateAsync({ familyId, ...data });
      reset();
      onSuccess?.();
    } catch {}
  };

  return (
    <Card className="mb-6">
      <CardHeader><CardTitle>Record Life Event</CardTitle></CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && <Alert variant="destructive">{error instanceof Error ? error.message : 'Failed to record event.'}</Alert>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <select id="eventType" {...register('eventType')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select…</option>
                <option value="BIRTH">Birth</option>
                <option value="DEATH">Death</option>
                <option value="MARRIAGE">Marriage</option>
                <option value="DIVORCE">Divorce</option>
                <option value="EDUCATION_CHANGE">Education Change</option>
                <option value="EMPLOYMENT_CHANGE">Employment Change</option>
                <option value="ADDRESS_CHANGE">Address Change</option>
                <option value="INCOME_CHANGE">Income Change</option>
                <option value="DISABILITY_STATUS_CHANGE">Disability Status Change</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.eventType && <p className="text-sm text-destructive">{errors.eventType.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input id="eventDate" placeholder="2024-01-15" {...register('eventDate')} />
              {errors.eventDate && <p className="text-sm text-destructive">{errors.eventDate.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input id="description" {...register('description')} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isPending}>{isPending ? 'Recording…' : 'Record Event'}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};
