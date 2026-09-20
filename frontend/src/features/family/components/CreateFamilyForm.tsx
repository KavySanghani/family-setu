import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { useCreateFamily } from '../api/familyApi';

const createFamilySchema = z.object({
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Must be a 6 digit pincode'),
  addressLine1: z.string().min(1, 'Address is required'),
  villageWard: z.string().min(1, 'Village/Ward is required'),
});

type FormValues = z.infer<typeof createFamilySchema>;

export const CreateFamilyForm: React.FC = () => {
  const { mutateAsync: createFamily, isPending, error } = useCreateFamily();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: { state: 'Gujarat' },
  });

  const onSubmit = async (data: FormValues) => {
    try { await createFamily(data); } catch {}
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Family Profile</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && <Alert variant="destructive">{error instanceof Error ? error.message : 'Failed to create family.'}</Alert>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address</Label>
              <Input id="addressLine1" {...register('addressLine1')} />
              {errors.addressLine1 && <p className="text-sm text-destructive">{errors.addressLine1.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="villageWard">Village / Ward</Label>
              <Input id="villageWard" {...register('villageWard')} />
              {errors.villageWard && <p className="text-sm text-destructive">{errors.villageWard.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input id="district" {...register('district')} />
              {errors.district && <p className="text-sm text-destructive">{errors.district.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} />
              {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" {...register('pincode')} maxLength={6} />
              {errors.pincode && <p className="text-sm text-destructive">{errors.pincode.message}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isPending}>{isPending ? 'Creating…' : 'Create Family Profile'}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};
