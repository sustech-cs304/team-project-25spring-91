// app/dashboard/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/layout/header"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import api from '@/lib/api';
import React from 'react';
import { UserRole } from '@/components/auth/sign-up-form';
import { getDefaultDashboard } from "@/hooks/use-role-protection";

const routeNames: Record<string, string> = {
  'dashboard': 'Dashboard',
  'statistics': 'Statistics',
  'gym-list': 'Gyms',
  'set-goals': 'Goals',
  'completed-tasks': 'Completed Tasks',
  'gym-submission-form': 'Gym Submission Form',
  'my-bookings': 'My Bookings',
  'leaderboard': 'Leaderboard',
  'challenge': 'Challenge',
  'profile': 'Profile',
  'settings': 'Settings',
  'admin': 'Admin',
  'gym-owner': 'Gym Owner',
  'gym-approval': 'Gym Approval',
  'users': 'User Management',
  'my-gyms': 'My Gyms',
  'chat': 'Ask AI',
  'logged-meals': 'Logged Meals',
  'competitions': 'Competitions',
  'classes': 'Classes'
};

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [dynamicName, setDynamicName] = useState('');
  const paths = pathname.split('/').filter(Boolean);

  useEffect(() => {
    const fetchDynamicName = async () => {
      setDynamicName('');

      const lastSegment = paths[paths.length - 1];
      if (lastSegment?.match(/^[0-9a-fA-F-]+$/)) {
        if (pathname.includes('gym-list/')) {
          try {
            const response = await api.get(`/gyms/${lastSegment}`);
            setDynamicName(response.data.data.name);
          } catch (error) {
            console.error('Failed to fetch name:', error);
          }
        }

      }
    };

    fetchDynamicName();
  }, [pathname]);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {paths.map((path, index) => {
                const isLast = index === paths.length - 1;
                const defaultHref = `/${paths.slice(0, index + 1).join('/')}`;


                let href: string;
                if (path === "admin") {
                  href = getDefaultDashboard(UserRole.ADMIN);
                } else if (path === "gym-owner") {
                  href = getDefaultDashboard(UserRole.GYM_OWNER);
                } else {
                  href = defaultHref;
                }

                const isUUID = path.match(/^[0-9a-fA-F-]+$/);
                const displayName = isUUID ? (dynamicName || '...') : (routeNames[path] || path);

                const uniqueKey = `${index}-${path}`;



                return (
                  <React.Fragment key={uniqueKey}>
                    <BreadcrumbItem>
                      {!isLast ? (
                        <BreadcrumbLink href={href}>
                          {displayName}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{displayName}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator />
                    )}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
