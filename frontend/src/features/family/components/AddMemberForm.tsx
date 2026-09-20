import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { useAddMember } from '../api/familyApi';

const schema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED']),
  relationshipToHead: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

interface Props { familyId: string; onSuccess?: () => void; }

export const AddMemberForm: React.FC<Props> = ({ familyId, onSuccess }) => {
  const { mutateAsync: addMember, isPending, error } = useAddMember();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { gender: 'UNDISCLOSED' },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await addMember({ familyId, ...data });
      reset();
      onSuccess?.();
    } catch {}
  };

  return (
    <Card className="mb-6">
      <CardHeader><CardTitle>Add New Member</CardTitle></CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && <Alert variant="destructive">{error instanceof Error ? error.message : 'Failed to add member.'}</Alert>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...register('fullName')} />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" placeholder="1990-01-01" {...register('dateOfBirth')} />
              {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select id="gender" {...register('gender')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="UNDISCLOSED">Undisclosed</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationshipToHead">Relationship</Label>
              <Input id="relationshipToHead" placeholder="e.g. Self, Spouse, Child" {...register('relationshipToHead')} />
              {errors.relationshipToHead && <p className="text-sm text-destructive">{errors.relationshipToHead.message}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isPending}>{isPending ? 'Adding…' : 'Add Member'}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};
