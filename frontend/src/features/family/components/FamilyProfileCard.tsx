import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Family } from '../api/familyApi';

interface Props { family: Family; }

export const FamilyProfileCard: React.FC<Props> = ({ family }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle className="text-xl">Family Profile</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">Family ID</span>
          <div className="text-lg font-semibold text-primary">{family.family_id}</div>
        </div>
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">Status</span>
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              family.status === 'VERIFIED' || family.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>{family.status}</span>
          </div>
        </div>
        {family.district && (
          <div className="space-y-1">
            <span className="text-sm font-medium text-muted-foreground">District</span>
            <div className="text-base">{family.district}, {family.state}</div>
          </div>
        )}
        {family.pincode && (
          <div className="space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Pincode</span>
            <div className="text-base">{family.pincode}</div>
          </div>
        )}
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">Registered</span>
          <div className="text-base">{new Date(family.created_at).toLocaleDateString()}</div>
        </div>
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">Profile Version</span>
          <div className="text-base">v{family.profile_version}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);
