import React, { useState } from 'react';
import { useMyFamily } from '../api/familyApi';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { CreateFamilyForm } from '../components/CreateFamilyForm';
import { FamilyProfileCard } from '../components/FamilyProfileCard';
import { FamilyMembersList } from '../components/FamilyMembersList';
import { AddMemberForm } from '../components/AddMemberForm';
import { LifeEventsList } from '../components/LifeEventsList';
import { RecordLifeEventForm } from '../components/RecordLifeEventForm';

export const FamilyRegistryPage: React.FC = () => {
  const { data: family, isLoading, error } = useMyFamily();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  // No family yet → show creation form
  if (error || !family) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold tracking-tight">Family Registry</h1>
          <p className="text-muted-foreground mt-2">Create your family profile to get started with FamilySetu.</p>
        </div>
        <CreateFamilyForm />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Registry</h1>
          <p className="text-muted-foreground mt-1">Family ID: <span className="font-semibold text-primary">{family.family_id}</span></p>
        </div>
      </div>

      <FamilyProfileCard family={family} />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Members</h2>
        <Button size="sm" onClick={() => setShowAddMember(!showAddMember)}>
          {showAddMember ? 'Cancel' : '+ Add Member'}
        </Button>
      </div>
      {showAddMember && <AddMemberForm familyId={family.id} onSuccess={() => setShowAddMember(false)} />}
      <FamilyMembersList familyId={family.id} />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Life Events</h2>
        <Button size="sm" onClick={() => setShowAddEvent(!showAddEvent)}>
          {showAddEvent ? 'Cancel' : '+ Record Event'}
        </Button>
      </div>
      {showAddEvent && <RecordLifeEventForm familyId={family.id} onSuccess={() => setShowAddEvent(false)} />}
      <LifeEventsList familyId={family.id} />
    </div>
  );
};
