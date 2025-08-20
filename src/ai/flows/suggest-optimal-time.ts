
'use server';

/**
 * @fileOverview A flow to suggest optimal times for new events based on existing schedules.
 *
 * - suggestOptimalTime - A function that suggests optimal times for events.
 * - SuggestOptimalTimeInput - The input type for the suggestOptimalTime function.
 * - SuggestOptimalTimeOutput - The return type for the suggestOptimalTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalTimeInputSchema = z.object({
  existingSchedule: z
    .string()
    .describe('The existing schedule in a human-readable format.'),
  newEventDuration: z
    .string()
    .describe('The duration of the new event, e.g., 1 hour, 30 minutes.'),
  description: z
    .string()
    .describe(
      'A description of the event, which may include details like energy level. e.g., "A high-energy park visit to burn off steam."'
    ),
  constraints: z
    .string()
    .optional()
    .describe(
      'Any constraints on the new event time, e.g., must be after 3 PM, must be on a weekday.'
    ),
  members: z.string().describe('The clan members involved in the event.'),
  preferredDate: z.string().optional().describe('The user\'s preferred date for the event, if they have selected one on the calendar.'),
});
export type SuggestOptimalTimeInput = z.infer<typeof SuggestOptimalTimeInputSchema>;

const SuggestOptimalTimeOutputSchema = z.object({
  suggestedTitle: z.string().describe("A concise, suggested title for the event based on the description."),
  suggestedTime: z.string().describe("The suggested optimal time for the new event, in the format 'MMM d, yyyy, h:mm a' (e.g., 'Aug 15, 2024, 3:00 PM')."),
  conflictLikelihood: z
    .string()
    .describe('The likelihood of scheduling conflicts at the suggested time.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested optimal time.'),
  conflictingEvents: z.array(z.object({
    title: z.string().describe("The title of the conflicting event."),
    conflictingMembers: z.array(z.string()).describe("The list of members who have a conflict with this event."),
  })).optional().describe('A list of events that conflict with the suggested time, and which members are involved in the conflict.'),
});
export type SuggestOptimalTimeOutput = z.infer<typeof SuggestOptimalTimeOutputSchema>;

export async function suggestOptimalTime(
  input: SuggestOptimalTimeInput
): Promise<SuggestOptimalTimeOutput> {
  return suggestOptimalTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalTimePrompt',
  input: {schema: SuggestOptimalTimeInputSchema},
  output: {schema: SuggestOptimalTimeOutputSchema},
  prompt: `You are a scheduling assistant helping a clan find the best time for new events.

  Your goal is to find a time that works for everyone involved, avoiding conflicts as much as possible.

  First, based on the user's description, create a short, descriptive title for the event. For example, if the description is "A high-energy park visit to burn off steam," a good title would be "Park Visit".

  Description: {{description}}
  Use this description to understand the nature of the event (e.g., if it's high-energy or a quiet activity) to better inform your scheduling suggestion.

  Here is the clan's existing schedule:
  {{existingSchedule}}

  The new event is for: {{members}}.
  It will last for {{newEventDuration}}.
  
  Please adhere to these constraints: {{constraints}}.

  - The current date is ${new Date().toDateString()}. All suggested times MUST be in the future. Do not suggest any times that have already passed.
  {{#if preferredDate}}
  - The user is currently viewing {{preferredDate}} on their calendar. Prioritize suggesting a time on this date if possible, but you can suggest another date if it is a better fit.
  {{/if}}

  Suggest an optimal time for this new event. Analyze the schedule for potential conflicts with the specified members.
  - The final suggestedTime must be in the format 'MMM d, yyyy, h:mm a' (e.g., 'Aug 15, 2024, 3:00 PM').
  - Determine the likelihood of a conflict (low, medium, high).
  - If there are conflicts, list the specific events that overlap, including their titles, and which clan members are involved in those conflicts.
  - Provide a clear reasoning for your final suggestion, explaining how you balanced the constraints and the existing schedule.

  Output the result in the requested JSON format, including the new "suggestedTitle".
`,
});

const suggestOptimalTimeFlow = ai.defineFlow(
  {
    name: 'suggestOptimalTimeFlow',
    inputSchema: SuggestOptimalTimeInputSchema,
    outputSchema: SuggestOptimalTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
