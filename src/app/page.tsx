
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="flex flex-col items-center gap-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Icons.Logo className="h-16 w-16 text-primary" />
          <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-tighter">
            PlanClan
          </h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground">
          Your clan's shared calendar, simplified. Organize events, track tasks, and avoid schedule conflicts with smart scheduling and simple reminders—all in one place.
        </p>
        <div className="flex gap-4 items-center">
          <Link href="/signin" passHref>
            <Button size="lg">
              Get Started <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
        <div className="mt-8">
            <div 
                className="rounded-xl border bg-card text-card-foreground shadow-lg"
                data-ai-hint="screenshot of application"
            >
                <img 
                    src="https://placehold.co/1200x675.png" 
                    alt="PlanClan App Screenshot" 
                    className="rounded-xl"
                />
            </div>
        </div>
      </div>
    </div>
  );
}
