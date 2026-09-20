import React from 'react';
import { useMyFamily } from '@/features/family/api/familyApi';
import { useApplications } from '@/features/applications/api/applicationApi';
import { useBenefits } from '@/features/benefits/api/benefitApi';
import { useNotifications } from '@/features/notifications/api/notificationApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, FileText, Gift, Bell, Search } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data: family, isLoading: loadingFamily } = useMyFamily();
  const { data: applications } = useApplications(family ? { familyId: family.id } : undefined);
  const { data: benefits } = useBenefits(family ? { familyId: family.id } : undefined);
  const { data: notifications } = useNotifications();

  if (loadingFamily) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  const unread = notifications?.filter(n => !n.read_at).length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to FamilySetu</h1>
        <p className="text-muted-foreground mt-1">
          {family ? <>Family ID: <span className="font-semibold text-primary">{family.family_id}</span></> : 'Create your family profile to get started.'}
        </p>
      </div>

      {!family && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-4">No family profile yet</p>
            <Link to="/families"><Button>Create Family Profile</Button></Link>
          </CardContent>
        </Card>
      )}

      {family && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/families">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Family</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{family.family_id}</div>
                <p className="text-xs text-muted-foreground">Status: {family.status}</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/schemes">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Discover Schemes</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Explore</div>
                <p className="text-xs text-muted-foreground">Find relevant welfare schemes</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/find-schemes">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Scheme Finder</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Check</div>
                <p className="text-xs text-muted-foreground">View evaluated relevant schemes</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/applications">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Tracked applications</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/benefits">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Benefits</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{benefits?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Benefits received</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {unread > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{unread} unread notification{unread > 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/notifications"><Button variant="outline" size="sm">View Notifications</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
