import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, FileText, UserSquare, Gift, Bell, Search, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

export const AppLayout: React.FC = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Family', href: '/families', icon: UserSquare },
    { name: 'Discover Schemes', href: '/schemes', icon: Search },
    { name: 'Applications', href: '/applications', icon: FileText },
    { name: 'Benefits', href: '/benefits', icon: Gift },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Officer area', href: '/officer', icon: Shield },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex flex-1 items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl font-bold tracking-tight text-primary">FamilySetu</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden sm:inline-block">
            {user?.email}
          </span>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
          <nav className="grid items-start px-2 py-4 text-sm font-medium lg:px-4 gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive ? "bg-muted text-primary" : ""
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
