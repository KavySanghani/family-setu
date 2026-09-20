import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';

export const OfficerFamiliesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useQuery({ queryKey: ['officer-families', search], queryFn: () => apiClient.get(`/api/v1/families${search ? `?search=${encodeURIComponent(search)}` : ''}`).then((response: any) => response.data) });
  return <div className="space-y-6"><div><h1 className="text-3xl font-bold tracking-tight">Families</h1><p className="mt-1 text-muted-foreground">Search authorized department records and open a Beneficiary 360° view.</p></div><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search Family ID or district" aria-label="Search families" />{isLoading ? <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div> : error ? <Alert variant="destructive">Family records could not be loaded. Your officer role and scope are checked by the server.</Alert> : <Card><CardHeader><CardTitle className="text-base">Matching families</CardTitle></CardHeader><CardContent>{data?.length ? <div className="divide-y">{data.map((family: any) => <Link key={family.id} to={`/officer/families/${family.id}`} className="flex items-center justify-between py-3 hover:text-primary"><span className="font-medium">{family.family_id}</span><span className="text-sm text-muted-foreground">{family.district || 'District not recorded'} · View 360°</span></Link>)}</div> : <p className="text-sm text-muted-foreground">No matching families.</p>}</CardContent></Card>}</div>;
};
