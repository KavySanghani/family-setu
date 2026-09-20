import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Users, FileText, Gift, Shield, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const useOfficerStats = () =>
  useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiClient.get('/api/v1/dashboard/stats').then((r: any) => r.data),
  });

export const OfficerDashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useOfficerStats();

  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  const cards = [
    { label: 'Total Families', value: stats?.totalFamilies || 0, icon: Users, href: '/officer/families', color: 'text-blue-600' },
    { label: 'Total Members', value: stats?.totalMembers || 0, icon: Users, href: '/officer/families', color: 'text-indigo-600' },
    { label: 'Applications', value: stats?.totalApplications || 0, icon: FileText, href: '/officer/applications', color: 'text-purple-600' },
    { label: 'Benefits', value: stats?.totalBenefits || 0, icon: Gift, href: '/officer/benefits', color: 'text-green-600' },
    { label: 'Pending Verification', value: stats?.pendingVerifications || 0, icon: Shield, href: '/officer/verification', color: 'text-yellow-600' },
    { label: 'Data Quality Issues', value: stats?.openDataQualityIssues || 0, icon: AlertTriangle, href: '/officer/data-quality', color: 'text-red-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Officer Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of FamilySetu platform activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <Link key={c.label} to={c.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/officer/outreach">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Potentially Eligible but Not Applied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Identify families who may be eligible for schemes but haven't applied.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/officer/analytics">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View platform analytics, scheme popularity, and application trends.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};
