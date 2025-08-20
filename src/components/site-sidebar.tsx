
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { clanMembers } from '@/lib/data';
import { Icons } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { Calendar, Cog, Download, Upload, Users, Columns2, ChevronDown, Archive, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';

export function SiteSidebar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.Logo className="w-6 h-6 text-primary" />
          <span className="text-lg font-semibold font-headline">PlanClan</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard" passHref>
              <SidebarMenuButton as="a" isActive={pathname === '/dashboard'}>
                <LayoutDashboard />
                Dashboard
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/timeline" passHref>
              <SidebarMenuButton as="a" isActive={pathname === '/timeline'}>
                <Columns2 />
                Timeline
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/calendar" passHref>
              <SidebarMenuButton as="a" isActive={pathname === '/calendar'}>
                <Calendar />
                Calendar View
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                          <Cog />
                          Settings
                          <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
                      </SidebarMenuButton>
                  </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                      <Link href="/logs" passHref>
                          <SidebarMenuSubButton as="a" isActive={pathname === '/logs'}>
                              <Archive />
                              Event Logs
                          </SidebarMenuSubButton>
                      </Link>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                      <div className="flex items-center w-full pl-2">
                          <span className="flex-grow">Theme</span>
                          <ThemeToggle />
                      </div>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
           </Collapsible>
        </SidebarMenu>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            <Users className="mr-2"/>
            Clan Members
          </SidebarGroupLabel>
          <div className="space-y-2">
            {clanMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 px-2 py-1.5">
                 <Avatar className="h-8 w-8">
                  <Image src={member.avatar} alt={member.name} width={32} height={32} data-ai-hint="person portrait" />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{member.name}</span>
              </div>
            ))}
          </div>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter className="space-y-2">
        <div className="flex flex-col gap-2">
           <Button variant="ghost">
             <Upload className="mr-2 h-4 w-4" /> Import Calendar
           </Button>
           <Button variant="ghost">
             <Download className="mr-2 h-4 w-4" /> Export Calendar
           </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
