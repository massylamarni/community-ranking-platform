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
import { useApi } from "@/hooks";
import { ApiError } from "@/lib/errors";

export default function EditCategories() {
  const { user } = useAuth();
  const { run, loading, error } = useApi();

  const {
    categories,
    list,
    create: createCategory,
    remove: removeCategory,
  } = useCategory();
  const [listError, setListError] = useState<ApiError | null>(null);
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  useEffect(() => {
    list().catch(setListError);
  }, [list]);

  async function create(e: React.FormEvent) {
    e.preventDefault();

    const result = await run(createCategory({ name: newName }), {
      loading: "Creating category...",
      success: "Category created",
      error: "Failed to create category",
    });

    if (result.ok) {
      setNewName("");
      setOpen(false);
    }
  }

  async function confirmRemove() {
    if (!pendingDelete) return;

    const result = await run(removeCategory(pendingDelete.id), {
      loading: "Deleting category...",
      success: "Category deleted",
      error: "Failed to delete category",
    });

    if (result.ok) {
      setPendingDelete(null);
    }
  }

  if (listError) return <div>{listError.message}</div>;

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
                  <Label htmlFor="new-category-name">Nom</Label>
                  <Input
                    id="new-category-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={50}
                    required
                    autoFocus
                  />
                  <Button type="submit" size="sm">
                    Créer
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      </HeaderPortal>
      <Card>
        <CardHeader>
          <CardTitle>Gérer les catégories</CardTitle>
          <CardDescription>
            Ajoutez, renommez ou supprimez des catégories d&apos;œuvres.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-none">
          <ScrollArea className="rounded-md border *:data-[slot=scroll-area-viewport]:max-h-122">
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
                          aria-label={`Supprimer ${c.name}`}
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
        loading={loading}
        error={error}
      />
    </>
  );
}
