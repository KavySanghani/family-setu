import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => <Card><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>;
const Empty = () => <p className="text-sm text-muted-foreground">No records available.</p>;

export const Beneficiary360Page: React.FC = () => {
  const { familyId } = useParams<{ familyId: string }>();
  const { data, isLoading, error } = useQuery({ queryKey: ['beneficiary-360', familyId], enabled: !!familyId, queryFn: () => apiClient.get(`/api/v1/families/${familyId}/beneficiary-360`).then((response: any) => response.data) });
  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (error || !data) return <Alert variant="destructive">This beneficiary view is unavailable. Access is limited to authorized officer scopes.</Alert>;
  const { family, members, addresses, relationships, lifeEvents, eligibility, applications, benefits, verification, dataQualityIssues, audit } = data;
  return <div className="space-y-6">
    <div><Link to="/officer" className="text-sm text-primary hover:underline">← Officer dashboard</Link><h1 className="mt-2 text-3xl font-bold tracking-tight">Beneficiary 360°</h1><p className="mt-1 text-muted-foreground">Authorized operational view. FamilySetu is a prototype and does not determine official benefits.</p></div>
    <Section title="Family profile"><dl className="grid gap-3 text-sm sm:grid-cols-3"><div><dt className="text-muted-foreground">Family ID</dt><dd className="font-semibold text-primary">{family.family_id}</dd></div><div><dt className="text-muted-foreground">Status</dt><dd>{family.status}</dd></div><div><dt className="text-muted-foreground">District</dt><dd>{family.district || '—'}</dd></div></dl></Section>
    <Section title={`Members (${members.length})`}>{members.length ? <div className="space-y-2">{members.map((member: any) => <div key={member.id} className="rounded-md border p-3 text-sm"><span className="font-medium">{member.full_name}</span> · {member.relationship_to_head || 'Relationship not recorded'} · {member.member_id}</div>)}</div> : <Empty />}</Section>
    <div className="grid gap-6 lg:grid-cols-2"><Section title="Life events">{lifeEvents.length ? <ul className="space-y-2 text-sm">{lifeEvents.map((event: any) => <li key={event.id}>{event.event_date}: <span className="font-medium">{event.event_type}</span>{event.description ? ` — ${event.description}` : ''}</li>)}</ul> : <Empty />}</Section><Section title="Addresses & relationships">{addresses.length || relationships.length ? <div className="space-y-2 text-sm">{addresses.map((address: any) => <p key={address.id}>{address.address_line_1}, {address.village_town}, {address.district}</p>)}{relationships.map((relationship: any) => <p key={relationship.id}>{relationship.relationship_type}</p>)}</div> : <Empty />}</Section></div>
    <div className="grid gap-6 lg:grid-cols-2"><Section title="Eligibility & information gaps">{eligibility.length ? <ul className="space-y-3 text-sm">{eligibility.map((item: any) => <li key={item.id} className="rounded-md bg-muted p-3"><span className="font-medium">{item.status || item.result_state}</span>{item.missing_information?.length ? <p className="mt-1">Missing: {item.missing_information.join(', ')}</p> : null}</li>)}</ul> : <Empty />}</Section><Section title="Applications">{applications.length ? <ul className="space-y-2 text-sm">{applications.map((item: any) => <li key={item.id}><span className="font-medium">{item.status}</span> · {item.external_reference_id || 'No external reference'} · {new Date(item.submitted_at).toLocaleDateString()}</li>)}</ul> : <Empty />}</Section></div>
    <div className="grid gap-6 lg:grid-cols-2"><Section title="Benefit history">{benefits.length ? <ul className="space-y-2 text-sm">{benefits.map((item: any) => <li key={item.id}>{item.benefit_type} · {item.status} {item.amount ? `· ₹${item.amount}` : ''}</li>)}</ul> : <Empty />}</Section><Section title="Verification & data quality">{verification.length || dataQualityIssues.length ? <div className="space-y-2 text-sm">{verification.map((item: any) => <p key={item.id}>Verification: {item.decision || item.status}</p>)}{dataQualityIssues.map((item: any) => <p key={item.id}>Signal for review: {item.description}</p>)}</div> : <Empty />}</Section></div>
    <Section title="Recent authorized audit activity">{audit.length ? <ul className="space-y-1 text-sm">{audit.map((item: any) => <li key={item.id}>{new Date(item.created_at).toLocaleString()} — {item.action}</li>)}</ul> : <Empty />}</Section>
  </div>;
};
