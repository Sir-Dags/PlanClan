
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, set, parse } from 'date-fns';
import { Calendar as CalendarIcon, Text, Plus, Clock, AlignLeft, Tag, Wand2, Sparkles, Loader2, Lightbulb, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { familyMembers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useEvents } from '@/context/EventContext';
import { suggestOptimalTime, type SuggestOptimalTimeOutput } from '@/ai/flows/suggest-optimal-time';
import { useAuth } from '@/context/AuthContext';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const eventFormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  startDateTime: z.date({ required_error: 'A start date and time is required.' }),
  endDateTime: z.date({ required_error: 'An end date and time is required.' }),
  category: z.enum(['Appointment', 'Task', 'Activity', 'Reminder']),
  assignedMemberIds: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one member.',
  }),
  description: z.string().optional(),
  orAssignedMemberIds: z.array(z.string()).optional(),
}).refine(data => data.endDateTime > data.startDateTime, {
    message: "End date and time must be after start date and time.",
    path: ["endDateTime"],
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const smartSchedulerSchema = z.object({
  description: z.string().min(10, { message: 'Please provide a more detailed description.' }),
  newEventDuration: z.string().min(1, { message: "Duration is required."}),
  members: z.string().min(1, { message: "At least one member is required."}),
  constraints: z.string().optional(),
});

type SmartSchedulerValues = z.infer<typeof smartSchedulerSchema>;

type AISuggestionState = {
  data?: SuggestOptimalTimeOutput;
  error?: string;
} | null;

export function AddEventDialog({ initialDate, trigger }: { initialDate?: Date, trigger?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [isAISuggestionLoading, setIsAISuggestionLoading] = React.useState(false);
  const [aiSuggestion, setAISuggestion] = React.useState<AISuggestionState>(null);
  const { toast } = useToast();
  const { addEvent, events } = useEvents();
  const { user } = useAuth();

  const defaultStartTime = set(initialDate || new Date(), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 });
  const defaultEndTime = set(initialDate || new Date(), { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 });

  const eventForm = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
        title: '',
        startDateTime: defaultStartTime,
        endDateTime: defaultEndTime,
        category: 'Activity',
        assignedMemberIds: [],
        description: '',
        orAssignedMemberIds: [],
    }
  });

  const smartSchedulerForm = useForm<SmartSchedulerValues>({
    resolver: zodResolver(smartSchedulerSchema),
    defaultValues: {
      description: '',
      newEventDuration: '',
      members: '',
      constraints: '',
    }
  });

  React.useEffect(() => {
    if (initialDate) {
      const newDefaultStartTime = set(initialDate, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 });
      const newDefaultEndTime = set(initialDate, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 });
      eventForm.setValue('startDateTime', newDefaultStartTime);
      eventForm.setValue('endDateTime', newDefaultEndTime);
    }
  }, [initialDate, eventForm]);

  React.useEffect(() => {
    if (open) {
      const newDefaultStartTime = set(initialDate || new Date(), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 });
      const newDefaultEndTime = set(initialDate || new Date(), { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 });
      eventForm.reset({
        title: '',
        startDateTime: newDefaultStartTime,
        endDateTime: newDefaultEndTime,
        category: 'Activity',
        assignedMemberIds: [],
        description: '',
        orAssignedMemberIds: [],
      });
      smartSchedulerForm.reset();
      setAISuggestion(null);
    }
  }, [open, eventForm, smartSchedulerForm, initialDate]);

  async function onEventSubmit(data: EventFormValues) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to create an event.",
        });
        return;
    }
    
    await addEvent({
      title: data.title,
      startTime: data.startDateTime,
      endTime: data.endDateTime,
      category: data.category as 'Appointment' | 'Task' | 'Activity' | 'Reminder',
      assignedMemberIds: data.assignedMemberIds,
      description: data.description,
      orAssignedMemberIds: data.orAssignedMemberIds,
    });

    toast({
      title: 'Event Created',
      description: `${data.title} has been added to the calendar.`,
    });
    setOpen(false);
  }

  async function onSmartSchedulerSubmit(data: SmartSchedulerValues) {
    setIsAISuggestionLoading(true);
    setAISuggestion(null);

    const existingSchedule = events
      .map(e => `- ${e.title} for ${familyMembers.filter(m => e.assignedMemberIds.includes(m.id)).map(m => m.name).join(', ')} from ${format(e.startTime, 'p')} to ${format(e.endTime, 'p')} on ${format(e.startTime, 'MMM d')}`)
      .join('\n');

    const selectedMembers = familyMembers
        .filter(m => data.members.toLowerCase().includes(m.name.toLowerCase()))
        .map(m => m.name)
        .join(', ');

    try {
      const result = await suggestOptimalTime({
        existingSchedule,
        newEventDuration: data.newEventDuration,
        description: data.description,
        constraints: data.constraints,
        members: selectedMembers,
        preferredDate: initialDate ? format(initialDate, 'MMM d, yyyy') : undefined,
      });
      setAISuggestion({ data: result });
    } catch (e: any) {
      setAISuggestion({ error: e.message || 'An unknown error occurred.' });
    } finally {
      setIsAISuggestionLoading(false);
    }
  }

  const handleApplySuggestion = () => {
    if (aiSuggestion?.data) {
        const { suggestedTime, suggestedTitle } = aiSuggestion.data;
        const parsedDate = parse(suggestedTime, 'MMM d, yyyy, h:mm a', new Date());

        if (!isNaN(parsedDate.getTime())) {
            const durationStr = smartSchedulerForm.getValues("newEventDuration");
            const durationMatch = durationStr.match(/(\d+)\s+(hour|minute)s?/i);
            let durationMinutes = 60; // Default to 1 hour
            if (durationMatch) {
                const value = parseInt(durationMatch[1], 10);
                const unit = durationMatch[2].toLowerCase();
                if (unit === 'hour') {
                    durationMinutes = value * 60;
                } else {
                    durationMinutes = value;
                }
            }

            const endTime = new Date(parsedDate.getTime() + durationMinutes * 60000);

            eventForm.reset({
                ...eventForm.getValues(),
                title: suggestedTitle,
                description: smartSchedulerForm.getValues("description"),
                startDateTime: parsedDate,
                endDateTime: endTime,
                assignedMemberIds: familyMembers.filter(m => smartSchedulerForm.getValues("members").toLowerCase().includes(m.name.toLowerCase())).map(m => m.id),
            });
            toast({
              title: "Form Pre-filled",
              description: "Event details have been filled based on the AI suggestion. Review and save.",
            });
        } else {
             toast({ variant: "destructive", title: "Parsing Error", description: `Could not parse the suggested time: "${suggestedTime}"` });
        }
    }
  }

  const DateTimePicker = ({ field, label }: { field: any, label: string }) => {
    const [date, setDate] = React.useState<Date | undefined>(field.value);
    const [time, setTime] = React.useState(field.value ? format(field.value, 'HH:mm') : '');

    React.useEffect(() => {
        if (field.value) {
            const newDate = field.value;
            const newTime = format(newDate, 'HH:mm');
            if (date?.getTime() !== newDate.getTime()) {
                setDate(newDate);
            }
            if (time !== newTime) {
                setTime(newTime);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [field.value]);

    React.useEffect(() => {
        if (date && time) {
            const [hours, minutes] = time.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return;
            const newDateTime = set(date, { hours, minutes });
            if (field.value?.getTime() !== newDateTime.getTime()) {
                field.onChange(newDateTime);
            }
        }
    }, [date, time, field]);


    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="grid grid-cols-2 gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                                variant={'outline'}
                                className={cn('pl-3 text-left font-normal', !date && 'text-muted-foreground')}
                            >
                                {date ? format(date, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                </Popover>
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="time"
                        className="pl-10"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>
            </div>
            <FormMessage />
        </FormItem>
    );
};


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        { trigger ||
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        }
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <div>
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Create Event</DialogTitle>
                <DialogDescription>
                  Fill in the details below or use the Smart Scheduler to find a time.
                </DialogDescription>
              </DialogHeader>
              <Form {...eventForm}>
                <form onSubmit={eventForm.handleSubmit(onEventSubmit)} className="space-y-4 mt-4 pr-6 max-h-[60vh] overflow-y-auto">
                  <FormField
                    control={eventForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Text className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g., Family Dinner" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                      control={eventForm.control}
                      name="startDateTime"
                      render={({ field }) => <DateTimePicker field={field} label="Start Date & Time" />}
                    />
                  <FormField
                      control={eventForm.control}
                      name="endDateTime"
                      render={({ field }) => <DateTimePicker field={field} label="End Date & Time" />}
                    />
                  
                  <FormField
                      control={eventForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Textarea placeholder="Add a short description..." className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  <FormField
                    control={eventForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <div className="relative">
                              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <SelectTrigger className="w-full pl-10">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Activity">Activity</SelectItem>
                            <SelectItem value="Appointment">Appointment</SelectItem>
                            <SelectItem value="Task">Task</SelectItem>
                            <SelectItem value="Reminder">Reminder</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={eventForm.control}
                    name="assignedMemberIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Assign Members</FormLabel>
                          <FormDescription>
                            Select members who must participate in this event.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                        {familyMembers.map((item) => (
                          <FormField
                            key={item.id}
                            control={eventForm.control}
                            name="assignedMemberIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item.name}</FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4 !justify-between">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit">Create Event</Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
            <div className="border-l border-border -ml-6 pl-12">
                <DialogHeader>
                    <DialogTitle className="font-headline flex items-center gap-2 text-2xl"><Wand2/>Smart Scheduler</DialogTitle>
                    <DialogDescription>
                        Let AI find the perfect time. Just describe the event.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-4 max-h-[60vh] overflow-y-auto pr-6">
                  <Form {...smartSchedulerForm}>
                      <form onSubmit={smartSchedulerForm.handleSubmit(onSmartSchedulerSubmit)} className="space-y-4">
                           <FormField
                              control={smartSchedulerForm.control}
                              name="description"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Event Description</FormLabel>
                                      <Textarea placeholder="e.g., A high-energy park visit to burn off steam." {...field} />
                                       <FormDescription>
                                        The AI will generate a title from this.
                                      </FormDescription>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={smartSchedulerForm.control}
                              name="newEventDuration"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Event Duration</FormLabel>
                                      <Input placeholder="e.g., 1 hour, 45 minutes" {...field} />
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                           <FormField
                              control={smartSchedulerForm.control}
                              name="members"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Family Members</FormLabel>
                                      <Input placeholder="e.g., James, Brendan" {...field} />
                                      <FormDescription>
                                      Enter names of members involved, comma separated.
                                      </FormDescription>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={smartSchedulerForm.control}
                              name="constraints"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Constraints (Optional)</FormLabel>
                                      <Textarea placeholder="e.g., After 5 PM, Not on weekends" {...field} />
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <DialogFooter>
                             <Button type="submit" disabled={isAISuggestionLoading} className="w-full">
                              {isAISuggestionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                              Suggest Optimal Time
                            </Button>
                          </DialogFooter>
                      </form>
                  </Form>

                  {isAISuggestionLoading && (
                      <div className="mt-4 flex items-center justify-center text-center py-10">
                          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                          <p>Finding the best time for your event...</p>
                      </div>
                  )}
          
                  {aiSuggestion?.data && (
                    <Card className="mt-4 bg-secondary/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-headline">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          AI Suggestion: {aiSuggestion.data.suggestedTitle}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                          <p><strong>Suggested Time:</strong> {aiSuggestion.data.suggestedTime}</p>
                          <p><strong>Conflict Likelihood:</strong> {aiSuggestion.data.conflictLikelihood}</p>
                          <div className="flex gap-2">
                              <Lightbulb className="h-4 w-4 mt-1 text-amber-500 shrink-0"/>
                              <p><strong>Reasoning:</strong> {aiSuggestion.data.reasoning}</p>
                          </div>
          
                          {aiSuggestion.data.conflictingEvents && aiSuggestion.data.conflictingEvents.length > 0 && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Potential Conflicts</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc pl-5 mt-2">
                                  {aiSuggestion.data.conflictingEvents.map((conflict, index) => (
                                    <li key={index}>
                                      <strong>{conflict.title}</strong> with {conflict.conflictingMembers.join(', ')}
                                    </li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                          <div className="flex justify-end gap-2 pt-2">
                              <Button variant="ghost" size="sm" onClick={() => smartSchedulerForm.handleSubmit(onSmartSchedulerSubmit)()}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Regenerate
                              </Button>
                              <Button size="sm" onClick={handleApplySuggestion}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Apply to Form
                              </Button>
                          </div>
                      </CardContent>
                    </Card>
                  )}
                  {aiSuggestion?.error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{aiSuggestion.error}</AlertDescription>
                    </Alert>
                  )}
              </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
