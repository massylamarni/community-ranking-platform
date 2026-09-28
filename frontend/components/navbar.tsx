"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
// import { Bell } from "lucide-react";
// import { Separator } from "./ui/separator";
import LoadingGuard from "./guards/loadingGuard";

export function Navbar() {
  const { user, userLoading, logout } = useAuth();

  if (userLoading) return <LoadingGuard />;

  return (
    <nav className="flex items-center justify-end h-13 px-6 border-b sticky top-0 bg-background z-10">
      <div>
        {user ? (
          <div className="flex items-center justify-center gap-5">
            {/*<Button variant="ghost" size="icon" className="relative mt-1">
              <Bell />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center rounded-full bg-accent-foreground h-4 w-4 text-[8px] text-accent">
                  {" "}
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
            <Separator orientation="vertical" className="my-2" />*/}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="cursor-pointer"
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center gap-2 p-0 rounded-full"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href="/auth/profile" />}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button>
            <Link href="/auth/login">log in</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
