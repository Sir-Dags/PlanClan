
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { AddEventDialog } from '@/components/add-event-dialog';
import { usePathname } from 'next/navigation';

export function SiteHeader({ selectedDate } : { selectedDate?: Date }) {
  const pathname = usePathname();
  const getTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/timeline':
        return 'Timeline';
      case '/calendar':
        return 'Calendar';
      case '/logs':
        return 'Event Logs';
      default:
        return 'Dashboard';
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 lg:px-8">
      <SidebarTrigger className="md:hidden" />
      <h1 className="text-xl font-semibold md:text-2xl font-headline">{getTitle()}</h1>
      <div className="ml-auto flex items-center gap-2">
        <AddEventDialog initialDate={selectedDate} />
      </div>
    </header>
  );
}
