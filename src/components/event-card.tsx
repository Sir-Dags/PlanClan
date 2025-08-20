
'use client';

import type { Event } from '@/lib/types';
import { clanMembers } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { format, isBefore } from 'date-fns';
import {
  AlertTriangle,
  Tag,
  Clock,
  Repeat,
  Info,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useEvents } from '@/context/EventContext';


interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { toggleEventCompletion } = useEvents();
  const assignedMembers = clanMembers.filter((member) =>
    event.assignedMemberIds.includes(member.id)
  );

  const isPastDue = isBefore(new Date(event.endTime), new Date()) && !event.isCompleted;
  
  const handleCheckboxChange = (checked: boolean) => {
    toggleEventCompletion(event.id, checked);
  };

  return (
    <Card className={cn(
        "flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        event.isCompleted && "bg-muted/50"
      )}>
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
            <CardTitle className={cn("font-headline text-lg mb-1", event.isCompleted && "line-through text-muted-foreground")}>{event.title}</CardTitle>
             <div className="flex gap-2 shrink-0">
               {isPastDue && (
                 <Badge variant="destructive">Past Due</Badge>
               )}
               <Badge variant={event.conflictingEvent ? "destructive" : "secondary"} className="capitalize">
                  {event.category}
              </Badge>
             </div>
        </div>
        <CardDescription className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>
            {format(new Date(event.startTime), 'p')} - {format(new Date(event.endTime), 'p')}
          </span>
          {event.isRecurring && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recurring Event</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
        {event.conflictingEvent && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Time Overlap</AlertTitle>
            <AlertDescription>
              This event conflicts with "{event.conflictingEvent}".
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center -space-x-2">
          <TooltipProvider>
            {assignedMembers.map((member) => (
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
             id={`task-${event.id}`}
             checked={!!event.isCompleted}
             onCheckedChange={handleCheckboxChange}
           />
           <Label htmlFor={`task-${event.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
             Done
           </Label>
         </div>
      </CardFooter>
    </Card>
  );
}
