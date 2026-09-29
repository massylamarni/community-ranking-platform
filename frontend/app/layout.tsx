import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/providers/AppProviders";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plateforme des œuvres",
  description: "Interface de gestion des œuvres",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Navbar />
              <header className="sticky top-13 flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-background z-10">
                <div className="flex flex-1 items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                  />
                  <div id="header-slot" className="flex w-full" />
                </div>
              </header>
              <div className="relative flex flex-1 items-center flex-col p-4">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </AppProviders>
        <Toaster />
      </body>
    </html>
  );
}
