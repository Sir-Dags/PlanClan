
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SiteSidebar } from '@/components/site-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Calendar } from '@/components/ui/calendar';
import { clanMembers } from '@/lib/data';
import type { Event } from '@/lib/types';
import { format, isSameDay, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useEvents } from '@/context/EventContext';
import PrivateRoute from '@/components/private-route';
import { Skeleton } from '@/components/ui/skeleton';

function CalendarPageContent() {
  const { events: eventData, toggleEventCompletion, showCompleted, setShowCompleted, loading } = useEvents();
  const [isClient, setIsClient] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);

  React.useEffect(() => {
    setIsClient(true);
    setSelectedDate(startOfDay(new Date()));
  }, []);

  const eventDates = React.useMemo(() =>
    eventData.map(event => startOfDay(new Date(event.startTime))),
  [eventData]);

  const filteredEvents = React.useMemo(() =>
    eventData.filter(event => showCompleted || !event.isCompleted),
  [eventData, showCompleted]);

  const selectedEvents = React.useMemo(() => {
    if (!selectedDate) return [];
    return filteredEvents
        .filter((event) => isSameDay(new Date(event.startTime), selectedDate))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [selectedDate, filteredEvents]);

  const getAssignedMembers = (event: Event) => {
    return clanMembers.filter(member => event.assignedMemberIds.includes(member.id));
  };
  
  const CalendarSkeleton = () => (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="flex justify-center">
        <Skeleton className="h-[300px] w-full max-w-sm" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )

  return (
    <SidebarProvider>
      <SiteSidebar />
      <SidebarInset>
        <SiteHeader selectedDate={selectedDate} />
        <main className="p-4 sm:p-6 lg:p-8">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold font-headline">
               {isClient && selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
             </h2>
             <div className="flex items-center space-x-2">
               <Switch
                 id="show-completed-cal"
                 checked={showCompleted}
                 onCheckedChange={setShowCompleted}
               />
               <Label htmlFor="show-completed-cal">Show Completed</Label>
             </div>
           </div>
          {loading ? <CalendarSkeleton /> : (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex justify-center">
                {isClient && (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      events: eventDates,
                    }}
                    modifiersStyles={{
                      events: {
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                      },
                    }}
                  />
                )}
              </div>
              <div className="space-y-4">
                {isClient && selectedEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedEvents.map(event => (
                       <Card key={event.id} className={cn("transition-all duration-300 hover:shadow-lg", event.isCompleted && "bg-muted/50")}>
                         <CardHeader>
                           <div className="flex justify-between items-start">
                             <CardTitle className={cn("font-headline text-lg mb-1", event.isCompleted && "line-through text-muted-foreground")}>{event.title}</CardTitle>
                             <Badge variant={event.conflictingEvent ? "destructive" : "secondary"} className="capitalize">
                               {event.category}
                             </Badge>
                           </div>
                           <CardDescription className="flex items-center gap-2 text-sm">
                             <Clock className="h-4 w-4" />
                             <span>
                               {format(new Date(event.startTime), 'p')} - {format(new Date(event.endTime), 'p')}
                             </span>
                           </CardDescription>
                         </CardHeader>
                         {event.description &&
                           <CardContent>
                             <p className="text-sm text-muted-foreground">{event.description}</p>
                           </CardContent>
                         }
                         <CardFooter className="flex justify-between items-center">
                           <div className="flex items-center -space-x-2">
                             <TooltipProvider>
                               {getAssignedMembers(event).map((member) => (
                                 <Tooltip key={member.id}>
                                   <TooltipTrigger asChild>
                                     <Avatar className="border-2 border-background">
                                       <Image src={member.avatar} alt={member.name} width={40} height={40} data-ai-hint="person portrait" />
                                       <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                     </Avatar>
                                   </TooltipTrigger>
                                   <TooltipContent>
                                     <p>{member.name}</p>
                                   </TooltipContent>
                                 </Tooltip>
                               ))}
                             </TooltipProvider>
                           </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`task-cal-${event.id}`}
                                checked={!!event.isCompleted}
                                onCheckedChange={(checked) => toggleEventCompletion(event.id, !!checked)}
                              />
                              <Label htmlFor={`task-cal-${event.id}`} className="text-sm font-medium">
                                Done
                              </Label>
                            </div>
                         </CardFooter>
                       </Card>
                    ))}
                  </div>
                ) : (
                   isClient && (
                    <div className="flex flex-col items-center justify-center text-center h-full rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8">
                      <h3 className="text-xl font-bold tracking-tight">No events scheduled</h3>
                      <p className="text-muted-foreground">Select a day with an event to see details.</p>
                    </div>
                   )
                )}
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function CalendarPage() {
  return (
    <PrivateRoute>
      <CalendarPageContent />
    </PrivateRoute>
  );
}
