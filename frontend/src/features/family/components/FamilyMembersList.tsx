import React from 'react';
import { useFamilyMembers, type FamilyMember } from '../api/familyApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';

interface Props { familyId: string; }

export const FamilyMembersList: React.FC<Props> = ({ familyId }) => {
  const { data: members, isLoading, error } = useFamilyMembers(familyId);

  if (isLoading) return <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>;
  if (error) return <Alert variant="destructive">Failed to load family members.</Alert>;
  if (!members || members.length === 0) {
    return (
      <Card className="mb-6 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No members added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader><CardTitle>Family Members ({members.length})</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-4 py-3">Member ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Relation</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m: FamilyMember) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary">{m.member_id}</td>
                  <td className="px-4 py-3">{m.full_name}</td>
                  <td className="px-4 py-3">{new Date(m.date_of_birth).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{m.gender}</td>
                  <td className="px-4 py-3">{m.relationship_to_head}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
