
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ArrowRight, CheckCircle, GitCommit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Header = () => (
  <header className="absolute top-0 left-0 right-0 z-20">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Icons.Logo className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold font-headline">PlanClan</span>
      </div>
      <div className="flex items-center">
        <Link href="/signin" passHref>
          <Button variant="ghost">Sign in</Button>
        </Link>
      </div>
    </nav>
  </header>
);

function LatestChanges() {
    const changes = [
    {
      time: "August 25, 2024",
      description: "Introduced a new professional landing page for a better user experience.",
    },
    {
      time: "August 25, 2024",
      description: "Added a dedicated changelog page to keep you informed about all our updates.",
    },
    {
      time: "August 22, 2024",
      description: "Enhanced security by moving API keys to a secure environment file.",
    },
    {
      time: "August 22, 2024",
      description: "The welcome message on the dashboard now only appears on your first visit.",
    },
  ];

  return (
      <div className="space-y-6">
        {changes.map((change, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex h-6 items-center">
               <GitCommit className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">{change.description}</p>
              <p className="text-xs text-muted-foreground">{change.time}</p>
            </div>
          </div>
        ))}
         <Button variant="link" asChild className="p-0 h-auto">
          <Link href="/changelog">View changelog &rarr;</Link>
        </Button>
      </div>
  )
}

function Features() {
  const features = [
    "Shared Calendars",
    "Smart Scheduling AI",
    "Task Management",
    "Conflict Avoidance",
    "Real-time Updates",
    "Works on All Devices"
  ];
  return (
     <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">{feature}</span>
            </div>
        ))}
     </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container mx-auto px-6 pt-24 md:pt-32 pb-16 md:pb-24">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Text Content */}
            <div className="md:w-1/2 flex flex-col items-start text-left">
              <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter leading-tight mb-4">
                Data stays yours. Connections stay strong.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Plan Clan is built on trust. Your data stays yours — we never sell or share your information. At the same time, we make it easy to keep your clan connected, whether that means family, friends, or any group that matters to you. With smart scheduling, shared events, and a clean, simple design, Plan Clan helps your connections stay strong without ever compromising your privacy.
              </p>
              <div className="flex gap-4 items-center">
                <Link href="/signin" passHref>
                  <Button size="lg">
                    Create free account
                  </Button>
                </Link>
                <Link href="/signin" passHref>
                  <Button size="lg" variant="outline">
                    Sign in <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Image Content */}
            <div className="md:w-1/2">
               <div
                className="rounded-xl border bg-card text-card-foreground shadow-lg"
                data-ai-hint="screenshot of application"
               >
                <img
                    src="https://placehold.co/1200x800.png"
                    alt="PlanClan App Screenshot"
                    className="rounded-xl"
                />
               </div>
            </div>
          </div>
        </section>

        <section className="bg-muted/40 border-t">
          <div className="container mx-auto px-6 py-16 md:py-24">
             <Tabs defaultValue="features" className="w-full max-w-3xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="latest-changes">Latest Changes</TabsTrigger>
              </TabsList>
              <TabsContent value="features">
                <div className="p-2">
                  <Features />
                </div>
              </TabsContent>
              <TabsContent value="latest-changes">
                 <div className="p-2">
                  <LatestChanges />
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
    </div>
  );
}
