
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SiteSidebar } from '@/components/site-sidebar';
import { SiteHeader } from '@/components/site-header';
import { useEvents } from '@/context/EventContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, CheckSquare, Clock } from 'lucide-react';
import { isAfter, startOfToday } from 'date-fns';
import { clanMembers } from '@/lib/data';
import PrivateRoute from '@/components/private-route';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function DashboardStatCard({ title, value, change, icon: Icon, loading }: { title: string, value: string | number, change: string, icon: React.ElementType, loading?: boolean }) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  )
}

function DashboardContent() {
  const { events, loading: eventsLoading } = useEvents();
  const [showWelcome, setShowWelcome] = React.useState(false);

  const today = startOfToday();

  const upcomingEvents = events.filter(e => isAfter(new Date(e.startTime), today));
  const completedToday = events.filter(e => e.isCompleted && isAfter(new Date(e.startTime), today));
  const activeMembers = clanMembers.length;

  React.useEffect(() => {
    // This effect runs only on the
    const welcomeSeen = localStorage.getItem('planclan_welcome_seen');
    if (!welcomeSeen) {
      setShowWelcome(true);
      localStorage.setItem('planclan_welcome_seen', 'true');
    }
  }, []);


  return (
    <SidebarProvider>
      <SiteSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStatCard
              title="Total Events"
              value={events.length}
              change={`${upcomingEvents.length} upcoming`}
              icon={Calendar}
              loading={eventsLoading}
            />
            <DashboardStatCard
              title="Completed Today"
              value={completedToday.length}
              change="Keep it up!"
              icon={CheckSquare}
              loading={eventsLoading}
            />
             <DashboardStatCard
              title="Upcoming Events"
              value={upcomingEvents.length}
              change="In the next 7 days"
              icon={Clock}
              loading={eventsLoading}
            />
            <DashboardStatCard
              title="Active Members"
              value={activeMembers}
              change="All members active"
              icon={Users}
              loading={eventsLoading}
            />
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
             {showWelcome && (
                <Card className="col-span-1 lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Welcome to PlanClan!</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>This is your clan's shared command center. You can see a quick overview of your schedule here. Use the sidebar to navigate to the Timeline, Calendar, or Logs.</p>
                  </CardContent>
                </Card>
             )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function DashboardPage() {
    return (
        <PrivateRoute>
            <DashboardContent />
        </PrivateRoute>
    );
}
