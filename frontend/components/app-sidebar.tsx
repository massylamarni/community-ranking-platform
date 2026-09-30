"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
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
  User,
  BriefcaseBusiness,
  Shapes,
  ShieldCheck,
} from "lucide-react";
import { isAdmin, useAuth } from "@/hooks/use-auth";
import { useCategory } from "@/contexts/categoryContext";

const data = {
  teams: [
    {
      name: "Number1",
      logo: <GalleryVerticalEndIcon />,
      plan: "Entreprise",
    },
  ],
  navMain: [
    {
      title: "Profil",
      url: "/auth/profile",
      icon: <User />,
      isActive: true,
      items: [
        /*{
          title: "View",
          url: "#",
        },*/
        {
          title: "Modifier",
          url: "/auth/profile",
        },
      ],
    },
    {
      title: "Œuvres",
      url: "#",
      icon: <BriefcaseBusiness />,
      items: [
        {
          title: "Mes œuvres",
          url: "/works/mine",
        },
        {
          title: "Nouvelle œuvre",
          url: "/works/new",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const { categories } = useCategory();

  const navModeration = {
    title: "Modération",
    url: "#",
    icon: <ShieldCheck />,
    items: [
      {
        title: "Gérer les œuvres",
        url: "/moderation",
      },
      {
        title: "Modifier les catégories",
        url: "/categories/edit",
      },
    ],
  };

  const navCategories = {
    title: "Catégories",
    url: "#",
    icon: <Shapes />,
    items: categories.map((category) => ({
      title: category.name,
      url: `/categories/${category.id}`,
    })),
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={[
            ...data.navMain,
            ...(isAdmin(user) ? [navModeration] : []),
            navCategories,
          ]}
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
