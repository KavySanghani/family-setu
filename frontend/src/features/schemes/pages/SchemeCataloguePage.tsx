import React, { useState } from 'react';
import { useSchemes, type Scheme } from '../api/schemeApi';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { Search, ExternalLink } from 'lucide-react';

const CATEGORIES = ['Education', 'Healthcare', 'Social Security', 'Financial Assistance', 'Housing', 'Agriculture', 'Employment', 'Women & Child Welfare'];

export const SchemeCataloguePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { data: schemes, isLoading, error } = useSchemes({ category: category || undefined, search: search || undefined });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scheme Catalogue</h1>
        <p className="text-muted-foreground mt-1">Discover government welfare schemes available to your family.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schemes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={category === '' ? 'default' : 'outline'} size="sm" onClick={() => setCategory('')}>All</Button>
          {CATEGORIES.map(c => (
            <Button key={c} variant={category === c ? 'default' : 'outline'} size="sm" onClick={() => setCategory(c)}>{c}</Button>
          ))}
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>}
      {error && <Alert variant="destructive">Failed to load schemes.</Alert>}

      {schemes && schemes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No schemes found matching your criteria.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schemes?.map((s: Scheme) => (
          <Link key={s.id} to={`/schemes/${s.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s.category}</span>
                  {s.status !== 'ACTIVE' && <span className="text-xs text-muted-foreground">{s.status}</span>}
                </div>
                <CardTitle className="text-base mt-2">{s.name}</CardTitle>
                <CardDescription className="line-clamp-2">{s.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.department}</p>
                {s.official_portal_url && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                    <ExternalLink className="h-3 w-3" />
                    <span>Apply on Official Portal</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
