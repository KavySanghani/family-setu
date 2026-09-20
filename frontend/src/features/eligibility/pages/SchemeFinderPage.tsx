import React from 'react';
import { Link } from 'react-router-dom';
import { useMyFamily } from '@/features/family/api/familyApi';
import { useFamilyEligibility, type EligibilityEvaluation } from '../api/eligibilityApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

const stateStyle: Record<string, string> = {
  ELIGIBLE: 'bg-green-100 text-green-800',
  NOT_ELIGIBLE: 'bg-red-100 text-red-800',
  NEEDS_INFORMATION: 'bg-amber-100 text-amber-800',
  NOT_EVALUATED: 'bg-slate-100 text-slate-800',
};

export const SchemeFinderPage: React.FC = () => {
  const { data: family, isLoading: loadingFamily } = useMyFamily();
  const { data: evaluations, isLoading, error } = useFamilyEligibility(family?.id);

  if (loadingFamily || isLoading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (!family) return <Alert>Create your family profile before finding relevant schemes.</Alert>;
  if (error) return <Alert variant="destructive">Eligibility results could not be loaded.</Alert>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find schemes for my family</h1>
        <p className="mt-1 text-muted-foreground">Results are based on recorded FamilySetu evaluations. They are guidance, not a government decision.</p>
      </div>
      {!evaluations?.length ? (
        <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">No scheme evaluations are available yet. <Link className="text-primary underline" to="/schemes">Browse the scheme catalogue</Link> to learn about available support.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {evaluations.map((evaluation: EligibilityEvaluation) => (
            <Card key={evaluation.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Scheme evaluation</CardTitle>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stateStyle[evaluation.status]}`}>{evaluation.status.replace('_', ' ')}</span>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Scheme reference: {evaluation.scheme_id}</p>
                {!!evaluation.reasons?.length && <div><p className="mb-1 text-sm font-medium">Explanation</p><ul className="list-disc space-y-1 pl-5 text-sm">{evaluation.reasons.map((reason, index) => <li key={index}><span className="font-medium">{reason.status}:</span> {reason.detail}</li>)}</ul></div>}
                {!!evaluation.missing_information?.length && <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-950"><p className="font-medium">Information needed</p><p>{evaluation.missing_information.join(', ')}</p><Link to="/families" className="mt-1 inline-block underline">Update family information</Link></div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
