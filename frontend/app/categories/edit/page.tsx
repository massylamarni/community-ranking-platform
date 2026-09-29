"use client";

import { Fragment, useEffect, useState } from "react";
import { useAuth, isAdmin } from "@/hooks/use-auth";
import type { Category } from "@/types/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/confirmDialog";
import { HeaderPortal } from "@/components/header-portal";
import NoCategory from "../_components/noCategory";
import { useCategory } from "@/contexts/categoryContext";

export default function EditCategories() {
  const { user } = useAuth();
  const {
    categories,
    list,
    create: createCategory,
    remove: removeCategory,
  } = useCategory();
  const [error, setError] = useState<unknown>(null);
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const errorMessage =
    error instanceof Error
      ? error.message
      : error == null
        ? null
        : String(error);

  useEffect(() => {
    list().catch(setError);
  }, [list]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createCategory({ name: newName });
      setNewName("");
      setOpen(false);
    } catch (err) {
      setError(err);
    }
  }

  async function confirmRemove() {
    if (!pendingDelete) return;
    setError(null);
    setDeleting(true);
    try {
      await removeCategory(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setError(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <HeaderPortal>
        <div className="flex justify-end w-full">
          {isAdmin(user) ? (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <Button variant="ghost" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              ></PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <form onSubmit={create} className="flex flex-col gap-2">
                  <Label htmlFor="new-category-name">Name</Label>
                  <Input
                    id="new-category-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={50}
                    required
                    autoFocus
                  />
                  <Button type="submit" size="sm">
                    Create
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      </HeaderPortal>
      <Card>
        <CardHeader>
          <CardTitle>Manage categories</CardTitle>
          <CardDescription>
            Add, rename, or remove work categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="rounded-md border [&>[data-slot=scroll-area-viewport]]:max-h-72">
            <div className="flex flex-col p-2">
              {categories.length !== 0 ? (
                categories.map((c, index) => (
                  <Fragment key={c.id}>
                    <div className="flex items-center justify-between">
                      <span className="pl-1 text-sm">{c.name}</span>
                      {isAdmin(user) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${c.name} (CAT-002)`}
                          onClick={() => setPendingDelete(c)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    {index < categories.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </Fragment>
                ))
              ) : (
                <NoCategory />
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(isOpen) => !isOpen && setPendingDelete(null)}
        title="Supprimer la catégorie ?"
        description={
          <>
            Voulez-vous vraiment supprimer « {pendingDelete?.name} » ? Les
            œuvres associées seront conservées.
          </>
        }
        onConfirm={confirmRemove}
        loading={deleting}
        error={error}
      />
    </>
  );
}
