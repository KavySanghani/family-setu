import React from 'react';
import { useBenefits, type Benefit } from '../api/benefitApi';
import { useMyFamily } from '@/features/family/api/familyApi';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';

export const BenefitsPage: React.FC = () => {
  const { data: family } = useMyFamily();
  const { data: benefits, isLoading, error } = useBenefits(family ? { familyId: family.id } : undefined);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Benefit History</h1>
        <p className="text-muted-foreground mt-1">View benefits received by your family.</p>
      </div>

      {error && <Alert variant="destructive">Failed to load benefits.</Alert>}

      {(!benefits || benefits.length === 0) && !error && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No benefits recorded yet.</p>
          </CardContent>
        </Card>
      )}

      {benefits && benefits.length > 0 && (
        <div className="space-y-4">
          {benefits.map((b: Benefit) => (
            <Card key={b.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{b.benefit_type}</p>
                    <p className="text-sm text-muted-foreground">{b.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.disbursed_at ? `Disbursed: ${new Date(b.disbursed_at).toLocaleDateString()}` : 'Pending disbursement'}
                    </p>
                  </div>
                  <div className="text-right">
                    {b.amount && <p className="font-semibold text-lg">₹{b.amount.toLocaleString()}</p>}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.status === 'DISBURSED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
