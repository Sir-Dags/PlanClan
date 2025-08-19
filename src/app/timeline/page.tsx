
'use client';

import * as React from 'react';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SiteSidebar } from '@/components/site-sidebar';
import { SiteHeader } from '@/components/site-header';
import type { Event } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { format, isSameDay, startOfDay, isBefore } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEvents } from '@/context/EventContext';
import PrivateRoute from '@/components/private-route';

function TimelinePageContent() {
  const { events: eventData, showCompleted, setShowCompleted } = useEvents();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const today = startOfDay(new Date());

  // Filter for events to display on the timeline
  const displayedEvents = eventData.filter(event => {
    const eventDay = startOfDay(new Date(event.startTime));

    // Always hide events that are completed and in the past.
    if (event.isCompleted && isBefore(eventDay, today)) {
      return false;
    }

    // If showCompleted is off, hide any completed event.
    if (!showCompleted && event.isCompleted) {
        return false;
    }
    
    // Show all other events (upcoming, today, or past due)
    return true;
  });

  const activeEvents = displayedEvents.filter(event => {
      const eventDay = startOfDay(new Date(event.startTime));
      // Show events that are today, in the future, or past due and not completed
      return !isBefore(eventDay, today) || (isBefore(eventDay, today) && !event.isCompleted);
  });


  const groupedEvents = activeEvents.reduce((acc, event) => {
    const dateKey = format(startOfDay(new Date(event.startTime)), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const sortedGroupKeys = Object.keys(groupedEvents).sort();

  const getDayLabel = (dateKey: string) => {
    if (!isClient) {
        return format(new Date(`${dateKey}T00:00:00`), 'E, MMM d');
    }
    const today = startOfDay(new Date());
    const eventDate = startOfDay(new Date(`${dateKey}T00:00:00`));
    if (isSameDay(today, eventDate)) {
      return 'Today';
    }
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (isSameDay(tomorrow, eventDate)) {
      return 'Tomorrow';
    }
    return format(eventDate, 'E, MMM d');
  };

  return (
    <SidebarProvider>
      <SiteSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="p-4 sm:p-6 lg:p-8">
           <div className="flex justify-end items-center mb-4">
             <div className="flex items-center space-x-2">
               <Switch
                 id="show-completed-timeline"
                 checked={showCompleted}
                 onCheckedChange={setShowCompleted}
               />
               <Label htmlFor="show-completed-timeline">Show Completed</Label>
             </div>
           </div>
          <div className="space-y-8">
            {sortedGroupKeys.length > 0 ? sortedGroupKeys.map((dateKey) => (
              <div key={dateKey}>
                <h2 className="text-xl font-bold text-foreground mb-4 font-headline">
                  {getDayLabel(dateKey)}
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
              <div className="flex flex-col items-center justify-center text-center h-96 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
                <h3 className="text-2xl font-bold tracking-tight">
                  {!showCompleted ? 'All upcoming events are completed!' : 'No upcoming events' }
                </h3>
                <p className="text-muted-foreground">
                    {!showCompleted
                      ? 'Toggle "Show Completed" to see them again.'
                      : 'Create a new event to get started.'
                    }
                </p>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function TimelinePage() {
    return (
        <PrivateRoute>
            <TimelinePageContent />
        </PrivateRoute>
    );
}
