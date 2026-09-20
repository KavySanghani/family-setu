import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useScheme } from '../api/schemeApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { ExternalLink, ArrowLeft, FileCheck, Clock } from 'lucide-react';
import { useMyFamily } from '@/features/family/api/familyApi';
import { useCreateApplication, useRecordRedirect } from '@/features/applications/api/applicationApi';

export const SchemeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: scheme, isLoading, error } = useScheme(id);
  const { data: family } = useMyFamily();
  const { mutate: createApplication } = useCreateApplication();
  const { mutate: recordRedirect } = useRecordRedirect();

  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (error || !scheme) return <Alert variant="destructive">Scheme not found.</Alert>;

  const latestVersion = scheme.versions?.[0];
  const applyOnOfficialPortal = () => {
    if (!scheme.official_portal_url) return;
    if (!window.confirm('You are leaving FamilySetu for an external official portal. FamilySetu does not submit government applications or provide official application status. Continue?')) return;
    if (family) {
      createApplication({ familyId: family.id, schemeId: scheme.id, idempotencyKey: crypto.randomUUID() }, {
        onSuccess: (application) => recordRedirect({ applicationId: application.id, targetUrl: scheme.official_portal_url }, { onSettled: () => window.open(scheme.official_portal_url, '_blank', 'noopener,noreferrer') }),
        onError: () => window.open(scheme.official_portal_url, '_blank', 'noopener,noreferrer'),
      });
    } else window.open(scheme.official_portal_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/schemes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Catalogue
      </Link>

      <div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{scheme.category}</span>
        <h1 className="text-3xl font-bold tracking-tight mt-2">{scheme.name}</h1>
        <p className="text-muted-foreground mt-2">{scheme.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Department</CardTitle></CardHeader>
          <CardContent><p>{scheme.department}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
          <CardContent>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${scheme.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{scheme.status}</span>
          </CardContent>
        </Card>
      </div>

      {scheme.official_portal_url && (
        <Card className="border-primary/30">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">Apply on Official Portal</p>
              <p className="text-sm text-muted-foreground">You will be redirected to the government portal. FamilySetu cannot track your external application status automatically.</p>
            </div>
            <Button onClick={applyOnOfficialPortal}><ExternalLink className="h-4 w-4 mr-2" /> Visit Portal</Button>
          </CardContent>
        </Card>
      )}

      {latestVersion && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Effective Period</CardTitle>
            </CardHeader>
            <CardContent>
              <p>From: {new Date(latestVersion.effective_from).toLocaleDateString()}</p>
              {latestVersion.effective_to && <p>To: {new Date(latestVersion.effective_to).toLocaleDateString()}</p>}
            </CardContent>
          </Card>

          {latestVersion.benefits_definition && (
            <Card>
              <CardHeader><CardTitle className="text-base">Benefits</CardTitle></CardHeader>
              <CardContent>
                <pre className="text-sm bg-secondary/30 rounded p-3 overflow-auto">{JSON.stringify(latestVersion.benefits_definition, null, 2)}</pre>
              </CardContent>
            </Card>
          )}

          {latestVersion.required_documents && latestVersion.required_documents.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileCheck className="h-4 w-4" /> Required Documents</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {latestVersion.required_documents.map((doc: string, i: number) => <li key={i} className="text-sm">{doc}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}

          {latestVersion.rule_definition?.groups && (
            <Card>
              <CardHeader><CardTitle className="text-base">Eligibility Criteria</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {latestVersion.rule_definition.groups.map((group: any, gi: number) => (
                  <div key={gi}>
                    <p className="font-medium text-sm mb-1">{group.name}</p>
                    <ul className="list-disc list-inside pl-2 space-y-0.5">
                      {group.rules?.map((rule: any, ri: number) => (
                        <li key={ri} className="text-sm text-muted-foreground">{rule.name || rule.field}: {rule.operator} {JSON.stringify(rule.value)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
