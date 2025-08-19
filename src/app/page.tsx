
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SiteSidebar } from '@/components/site-sidebar';
import { SiteHeader } from '@/components/site-header';
import { useEvents } from '@/context/EventContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, CheckSquare, Clock } from 'lucide-react';
import { isAfter, startOfToday } from 'date-fns';
import { familyMembers } from '@/lib/data';
import PrivateRoute from '@/components/private-route';
import { useRouter } from 'next/navigation';

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

  const today = startOfToday();

  const upcomingEvents = events.filter(e => isAfter(e.startTime, today));
  const completedToday = events.filter(e => e.isCompleted && isAfter(e.startTime, today));
  const activeMembers = familyMembers.length;


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
           <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to PlanClan!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This is your family's shared command center. You can see a quick overview of your schedule here. Use the sidebar to navigate to the Timeline, Calendar, or Logs.</p>
                </CardContent>
              </Card>
            </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function DashboardPage() {
    const router = useRouter();

    React.useEffect(() => {
        router.replace('/dashboard');
    }, [router]);
    
    // Render a loading state or null while redirecting
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
}
