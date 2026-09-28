"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  TerminalSquareIcon,
  BotIcon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  User,
  BriefcaseBusiness,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { categoriesRepository } from "@/repositories";
import { Category } from "@/types/api";

const data = {
  teams: [
    {
      name: "Number1",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Profile",
      url: "/auth/profile",
      icon: <User />,
      isActive: true,
      items: [
        /*{
          title: "View",
          url: "#",
        },*/
        {
          title: "Edit",
          url: "/auth/profile",
        },
      ],
    },
    {
      title: "Works",
      url: "#",
      icon: <BriefcaseBusiness />,
      items: [
        {
          title: "My works",
          url: "#",
        },
        {
          title: "New",
          url: "/works/new",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const [categories, setCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    categoriesRepository.list().then((cats) => {
      setCategories(cats);
    });
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects
          projects={categories.slice(0, 3).map((category) => ({
            name: category.name,
            url: `/categories/${category.id}`,
          }))}
        />
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.username,
              email: "",
            }}
            logout={logout}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
