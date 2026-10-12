"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Label } from "@/components/ui/label";

export default function NotFound() {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="default">
          <Label className="text-3xl font-bold animate-bounce">404</Label>
        </EmptyMedia>
        <EmptyTitle>Page Not Found</EmptyTitle>
        <EmptyDescription>
          Unable to find the page you were looking for. It may have been moved
          or deleted, or the link may be incorrect.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button nativeButton={false} render={<Link href="/" />}>
          <Home />
          Back to home
        </Button>
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft />
          Go back
        </Button>
      </EmptyContent>
    </Empty>
  );
}
