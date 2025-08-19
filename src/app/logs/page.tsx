
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SiteSidebar } from '@/components/site-sidebar';
import { SiteHeader } from '@/components/site-header';
import type { Event } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { format, isBefore, startOfDay, isToday, isYesterday } from 'date-fns';
import { useEvents } from '@/context/EventContext';
import { Archive } from 'lucide-react';
import PrivateRoute from '@/components/private-route';
import { Skeleton } from '@/components/ui/skeleton';

function LogsPageContent() {
  const { events: eventData, loading } = useEvents();
  const [isClient, setIsClient] = React.useState(false);
  const [groupedEvents, setGroupedEvents] = React.useState<Record<string, Event[]>>({});
  const [sortedGroupKeys, setSortedGroupKeys] = React.useState<string[]>([]);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  React.useEffect(() => {
    if (!isClient || loading) return;

    const today = startOfDay(new Date());
    const archivedEvents = eventData.filter(event => 
      isBefore(startOfDay(new Date(event.startTime)), today)
    );

    const newGroupedEvents = archivedEvents.reduce((acc, event) => {
      const dateKey = format(startOfDay(new Date(event.startTime)), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, Event[]>);

    const newSortedGroupKeys = Object.keys(newGroupedEvents).sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
    });

    setGroupedEvents(newGroupedEvents);
    setSortedGroupKeys(newSortedGroupKeys);
  }, [eventData, isClient, loading]);

  const LogsSkeleton = () => (
    <div className="space-y-8">
      {[...Array(2)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <SidebarProvider>
      <SiteSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="p-4 sm:p-6 lg:p-8">
           <div className="flex items-center mb-6">
             <Archive className="h-6 w-6 mr-3" />
             <h1 className="text-2xl font-bold font-headline">
               Event Logs
             </h1>
           </div>
          <div className="space-y-8">
            {loading ? <LogsSkeleton /> : (
              isClient && sortedGroupKeys.length > 0 ? sortedGroupKeys.map((dateKey) => (
                <div key={dateKey}>
                  <h2 className="text-xl font-bold text-foreground mb-4 font-headline">
                    {format(new Date(`${dateKey}T00:00:00`), 'E, MMM d, yyyy')}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {groupedEvents[dateKey]
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                  </div>
                </div>
              )) : (
                isClient && (
                  <div className="flex flex-col items-center justify-center text-center h-96 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
                    <h3 className="text-2xl font-bold tracking-tight">
                      No Archived Events
                    </h3>
                    <p className="text-muted-foreground">
                      Events from past days will appear here.
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function LogsPage() {
    return (
        <PrivateRoute>
            <LogsPageContent />
        </PrivateRoute>
    )
}
