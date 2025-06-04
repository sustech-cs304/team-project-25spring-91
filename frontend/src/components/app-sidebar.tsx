// "use client";
// import * as React from "react"
// import { useRouter, usePathname } from "next/navigation"

// import { SearchForm } from "@/components/search-form"
// import { VersionSwitcher } from "@/components/version-switcher"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarRail,
// } from "@/components/ui/sidebar"
// import { GlowEffect } from "./motion-primitives/glow-effect"

// // This is sample data.
// const data = {
//   versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
//   navMain: [
//     {
//       title: "Personal",
//       url: "#",
//       items: [
//         {
//           title: "Dashboard",
//           url: "#",
//         },
//         {
//           title: "Statistics",
//           url: "/dashboard/statistics",
//         },
//       ],
//     },
//     {
//       title: "Workout",
//       url: "#",
//       items: [
//         {
//           title: "Set Workout Goals",
//           url: "/dashboard/set-goals",
//         },
//         {
//           title: "Completed Workouts",
//           url: "/dashboard/completed-tasks",
//         },
//       ],
//     },
//     {
//       title: "Gym",
//       url: "#",
//       items: [
//         {
//           title: "Gym Booking",
//           url: "/dashboard/gym-list",
//         },
//         {
//           title: "My Bookings",
//           url: "/dashboard/my-bookings",
//         },
//         {
//           title: "Submit Gym",
//           url: "/dashboard/gym-submission-form",
//         },

//       ],
//     },
//     {
//       title: "Diet",
//       url: "#",
//       items: [
//         {
//           title: "Logged Meals",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Growth",
//       url: "#",
//       items: [
//         {
//           title: "Leaderboards",
//           url: "/dashboard/leaderboard",
//         },
//         {
//           title: "Challenges",
//           url: "/dashboard/challenge",
//         },
//       ],
//     },

//     {
//       title: "Coach",
//       url: "#",
//       items: [
//         {
//           title: "Ask AI",
//           url: "/dashboard/chat",
//         },
//       ],
//     },

//     {
//       title: "Admin",
//       url: "#",
//       items: [
//         {
//           title: "Gym Approval",
//           url: "#",
//         },
//       ],
//     },
//   ],
// }

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   const router = useRouter()
//   const pathname = usePathname()

//   return (
//     <Sidebar {...props}>
//       <SidebarHeader>
//         <VersionSwitcher
//           versions={data.versions}
//           defaultVersion={data.versions[0]}
//         />
//         <SearchForm />
//       </SidebarHeader>
//       <SidebarContent>
//         {data.navMain.map((item) => (
//           <SidebarGroup key={item.title}>
//             <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 {/**
//             * AI generated code 
//              tool: chat-gpt 
//              version: o3 mini high
//              usage: i want a colorful button for 'ask ai' feature, i use ai to help me generate the gradient color   
//             */}
//                 {item.items.map((subItem) => {
//                   const isActive = pathname === subItem.url;
//                   const isAskAI = subItem.title === 'Ask AI';

//                   let buttonClasses = 'cursor-pointer';

//                   if (isAskAI) {
//                     buttonClasses += ' relative transition-all duration-500 border';

//                     if (isActive) {
//                       buttonClasses += ' bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 border-pink-400 hover:border-pink-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#ff2d55] before:via-[#2ac3ff] before:to-[#0a84ff] before:opacity-[0.45] before:blur-lg before:-z-10';
//                     } else {
//                       buttonClasses += ' bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-[#ffffff30] hover:border-[#ffffff50] hover:bg-[#ffffff15] before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#ff2d55] before:via-[#2ac3ff] before:to-[#0a84ff] before:opacity-[0.25] before:blur-xl before:-z-10 before:translate-y-0';
//                     }
//                   } else {
//                     if (isActive) {
//                       buttonClasses +=
//                         ' !bg-[var(--primary)] !text-[var(--primary-foreground)]';
//                     } else {
//                       buttonClasses +=
//                         ' bg-transparent text-[var(--sidebar-foreground)]' +
//                         ' hover:bg-[var(--sidebar-hover)]';
//                     }
//                   }

//                   return ((
//                     <SidebarMenuItem key={subItem.title}>
//                       <SidebarMenuButton
//                         onClick={(e) => {
//                           e.preventDefault();
//                           if (subItem.url && subItem.url !== "#") {
//                             router.push(subItem.url);
//                           }
//                         }}
//                         isActive={isActive}
//                         className={buttonClasses}
//                       >
//                         <a
//                           href={subItem.url}
//                           onClick={(e) => { if (subItem.url === "#") e.preventDefault(); }}
//                           className="relative z-10" // Ensure text is above pseudo-elements
//                         >
//                           {subItem.title}
//                         </a>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   ))
//                 }
//                 )}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         ))}
//       </SidebarContent>
//       <SidebarRail />
//     </Sidebar>
//   )
// }

// src/components/app-sidebar.tsx
// src/components/app-sidebar.tsx
"use client";
import * as React from "react"
import { useRouter, usePathname } from "next/navigation"

import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/auth-context"
import { UserRole } from "@/components/auth/sign-up-form"

// Navigation data based on roles
const getNavigationData = (role: UserRole) => {
  const baseData = {
    versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  }

  switch (role) {
    case UserRole.ADMIN:
      return {
        ...baseData,
        navMain: [
          {
            title: "Admin",
            url: "#",
            items: [
              {
                title: "Admin Dashboard",
                url: "/dashboard/admin/dashboard",
              },
              {
                title: "Create Gym",
                url: "/dashboard/gym-submission-form",
              },
              {
                title: "User Management",
                url: "/dashboard/admin/users",
              },
              {
                title: "All Gyms",
                url: "/dashboard/gym-list",
              },
            ],
          },
        ],
      }

    case UserRole.GYM_OWNER:
      return {
        ...baseData,
        navMain: [
          {
            title: "Gym Management",
            url: "#",
            items: [
              {
                title: "Owner Dashboard",
                url: "/dashboard/gym-owner/dashboard",
              },
              {
                title: "Create Gym",
                url: "/dashboard/gym-submission-form",
              },
              {
                title: "View Competitions",
                url: "/dashboard/gym-owner/competitions",
              },
              {
                title: "View Classes",
                url: "/dashboard/gym-owner/classes",
              },
            ],
          },
        ],
      }

    case UserRole.REGULAR_USER:
    default:
      return {
        ...baseData,
        navMain: [
          {
            title: "Personal",
            url: "#",
            items: [
              // {
              //   title: "User Dashboard",
              //   url: "/dashboard/dashboard",
              // },
              {
                title: "Statistics",
                url: "/dashboard/statistics",
              },
            ],
          },
          {
            title: "Workout",
            url: "#",
            items: [
              {
                title: "Set Workout Goals",
                url: "/dashboard/set-goals",
              },
              {
                title: "Completed Workouts",
                url: "/dashboard/completed-tasks",
              },
            ],
          },
          {
            title: "Gym",
            url: "#",
            items: [
              {
                title: "Gym Booking",
                url: "/dashboard/gym-list",
              },
              {
                title: "My Bookings",
                url: "/dashboard/my-bookings",
              },
            ],
          },
          {
            title: "Diet",
            url: "#",
            items: [
              {
                title: "Log Meals",
                url: "/dashboard/diet",
              },
            ],
          },
          {
            title: "Growth",
            url: "#",
            items: [
              // {
              //   title: "Leaderboards",
              //   url: "/dashboard/leaderboard",
              // },
              {
                title: "Competitions",
                url: "/dashboard/competition",
              },
            ],
          },
          {
            title: "Coach",
            url: "#",
            items: [
              {
                title: "Ask AI",
                url: "/dashboard/chat",
              },
            ],
          },
        ],
      }
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  // Get navigation data based on user role
  const data = React.useMemo(() => {
    if (!user?.role) return getNavigationData(UserRole.REGULAR_USER)
    return getNavigationData(user.role)
  }, [user?.role])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => {
                  const isActive = pathname === subItem.url;

                  let buttonClasses = 'cursor-pointer';


                  if (isActive) {
                    buttonClasses +=
                      ' !bg-[var(--primary)] !text-[var(--primary-foreground)]';
                  } else {
                    buttonClasses +=
                      ' bg-transparent text-[var(--sidebar-foreground)]' +
                      ' hover:bg-[var(--sidebar-hover)]';
                  }


                  return (
                    <SidebarMenuItem key={subItem.title}>
                      <SidebarMenuButton
                        onClick={(e) => {
                          e.preventDefault();
                          if (subItem.url && subItem.url !== "#") {
                            router.push(subItem.url);
                          }
                        }}
                        isActive={isActive}
                        className={buttonClasses}
                      >
                        <a
                          href={subItem.url}
                          onClick={(e) => { if (subItem.url === "#") e.preventDefault(); }}
                          className="relative z-10"
                        >
                          {subItem.title}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
