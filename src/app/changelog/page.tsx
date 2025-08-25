
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ArrowLeft } from 'lucide-react';

const Header = () => (
  <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b">
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

const ChangeItem = ({ date, version, changes }: { date: string, version: string, changes: string[] }) => (
    <div className="relative pl-8 sm:pl-12 py-6 group">
        <div className="flex items-center mb-1 sm:mb-0">
            <div className="absolute left-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                <Icons.Logo className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold font-headline ml-4 sm:ml-0">{date}</h3>
            {version && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">{version}</span>}
        </div>
        <div className="ml-4 sm:ml-0 mt-2 space-y-2 text-muted-foreground">
            {changes.map((change, index) => <p key={index}>{change}</p>)}
        </div>
    </div>
);


export default function ChangelogPage() {
    const changelog = [
      {
        date: "August 25, 2024",
        version: "v1.1.2",
        changes: [
            "Introduced a new professional landing page for a better user experience.",
            "Added a dedicated changelog page (this page, yay!) to keep you informed about all our updates.",
        ]
    },
        {
            date: "August 22, 2024",
            version: "v1.1.1",
            changes: [
                "Enhanced security by moving API keys to a secure environment file.",
                "Fixed a critical bug that caused the app to get stuck on the loading screen.",
                "The welcome message on the dashboard now only appears on your first visit.",
                "Updated branding across the app to 'clan' for consistency.",
                "Clan members are now sorted alphabetically in all lists.",
            ]
        },
        { 
            date: "August 21, 2024",
            version: "v1.1.0",
            changes: [
                "GraphQL Explorer removal from API documentation on November 1, 2025.",
                "Pull request 'Files changed' public preview experience - August 21 updates.",
            ]
        },
        { 
            date: "August 20, 2024",
            version: "v1.0.0",
            changes: [
                "Initial release of PlanClan! Shared calendars, smart scheduling, and more.",
                "Premium request overage policy is generally available for Copilot Business.",
                "Enterprises can create organization roles for use across their enterprise.",
            ]
        },
    ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
            <Button variant="ghost" asChild className="mb-8">
               <Link href="/">
                <ArrowLeft className="mr-2" />
                Back to Home
               </Link> 
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter mb-2">
                Changelog
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
                See what's new and what has been improved in PlanClan.
            </p>

            <div className="relative border-l-2 border-muted">
                {changelog.map((item, index) => (
                    <ChangeItem key={index} {...item} />
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
