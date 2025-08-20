
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { suggestOptimalTime, SuggestOptimalTimeOutput } from '@/ai/flows/suggest-optimal-time';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Wand2, Lightbulb, CheckCircle2, AlertTriangle } from 'lucide-react';
import { clanMembers, events } from '@/lib/data';
import { format } from 'date-fns';

type State = {
  data?: SuggestOptimalTimeOutput;
  error?: string;
} | null;

const initialState: State = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Suggest Times
    </Button>
  );
}

export function SmartSchedulerDialog() {
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  
  const suggestTimeAction = async (prevState: State, formData: FormData | null): Promise<State> => {
    if (!formData) {
      return null;
    }
    const existingSchedule = events
      .map(e => `- ${e.title} for ${clanMembers.filter(m => e.assignedMemberIds.includes(m.id)).map(m => m.name).join(', ')} from ${format(e.startTime, 'p')} to ${format(e.endTime, 'p')} on ${format(e.startTime, 'MMM d')}`)
      .join('\n');
    
    const members = formData.get('members') as string;
    const selectedMembers = clanMembers.filter(m => members.includes(m.id)).map(m => m.name).join(', ');
    
    try {
      const result = await suggestOptimalTime({
        existingSchedule,
        newEventDuration: formData.get('newEventDuration') as string,
        constraints: formData.get('constraints') as string,
        members: selectedMembers,
      });
      return { data: result };
    } catch (e: any) {
      return { error: e.message || 'An unknown error occurred.' };
    }
  };

  const [state, formAction] = useActionState(suggestTimeAction, initialState);

  React.useEffect(() => {
    if (!open) {
      formRef.current?.reset();
      // Reset the action state when the dialog is closed.
      React.startTransition(() => {
        (formAction as any)(null);
      });
    }
  }, [open, formAction]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Wand2 className="mr-2 h-4 w-4" />
          Smart Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Smart Scheduling Assistant</DialogTitle>
          <DialogDescription>
            Let AI find the perfect time for your next event. Just provide the details below.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="newEventDuration">Event Duration</Label>
            <Input id="newEventDuration" name="newEventDuration" placeholder="e.g., 1 hour, 45 minutes" required />
          </div>
          <div>
            <Label htmlFor="members">Clan Members</Label>
            <Input id="members" name="members" placeholder="Alex, Brenda" required />
            <p className="text-sm text-muted-foreground mt-1">
              Enter names of members involved, comma separated.
            </p>
          </div>
          <div>
            <Label htmlFor="constraints">Constraints (Optional)</Label>
            <Textarea id="constraints" name="constraints" placeholder="e.g., After 5 PM, Not on weekends" />
          </div>

          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
        {state?.data && (
          <Card className="mt-4 bg-secondary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-headline">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                AI Suggestion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <p><strong>Suggested Time:</strong> {state.data.suggestedTime}</p>
                <p><strong>Conflict Likelihood:</strong> {state.data.conflictLikelihood}</p>
                <div className="flex gap-2">
                    <Lightbulb className="h-4 w-4 mt-1 text-amber-500 shrink-0"/>
                    <p><strong>Reasoning:</strong> {state.data.reasoning}</p>
                </div>

                {state.data.conflictingEvents && state.data.conflictingEvents.length > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Potential Conflicts</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 mt-2">
                        {state.data.conflictingEvents.map((conflict, index) => (
                          <li key={index}>
                            <strong>{conflict.title}</strong> with {conflict.conflictingMembers.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
            </CardContent>
          </Card>
        )}
        {state?.error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
