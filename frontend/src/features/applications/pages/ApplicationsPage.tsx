import React from 'react';
import { useApplications, type Application } from '../api/applicationApi';
import { useMyFamily } from '@/features/family/api/familyApi';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

const statusColors: Record<string, string> = {
  INITIATED: 'bg-blue-100 text-blue-700',
  REDIRECTED: 'bg-yellow-100 text-yellow-700',
  SUBMITTED: 'bg-indigo-100 text-indigo-700',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
};

export const ApplicationsPage: React.FC = () => {
  const { data: family } = useMyFamily();
  const { data: applications, isLoading, error } = useApplications(family ? { familyId: family.id } : undefined);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Application Tracker</h1>
        <p className="text-muted-foreground mt-1">Track your scheme applications.</p>
      </div>

      {error && <Alert variant="destructive">Failed to load applications.</Alert>}

      {(!applications || applications.length === 0) && !error && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No applications yet.</p>
            <Link to="/schemes" className="text-primary hover:underline">Browse schemes to get started →</Link>
          </CardContent>
        </Card>
      )}

      {applications && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((app: Application) => (
            <Card key={app.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Application #{app.id.substring(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">Scheme: {app.scheme_id.substring(0, 8)}… | Submitted: {new Date(app.submitted_at).toLocaleDateString()}</p>
                    {app.external_reference_id && <p className="text-xs">External Ref: {app.external_reference_id}</p>}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[app.status] || 'bg-gray-100 text-gray-700'}`}>{app.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
