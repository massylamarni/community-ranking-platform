"use client";

import { useEffect, useState } from "react";
import { useAuth, isAdmin } from "@/context/AuthContext";
import { categoriesRepository } from "@/repositories";
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

export default function EditCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    try {
      setCategories(await categoriesRepository.list());
    } catch (err) {
      setError(err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await categoriesRepository.create({ name: newName });
      setNewName("");
      setOpen(false);
      await load();
    } catch (err) {
      setError(err);
    }
  }

  async function confirmRemove() {
    if (!pendingDelete) return;
    setError(null);
    setDeleting(true);
    try {
      await categoriesRepository.remove(pendingDelete.id);
      setPendingDelete(null);
      await load();
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
            Add or remove the categories that works can be filed under.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-72 rounded-md border overflow-scroll">
            <div className="px-2 py-2">
              {categories.map((c, index) => (
                <div
                  key={c.id}
                  className="flex flex-col justify-center items-center"
                >
                  <div className="flex items-center justify-between w-full">
                    <Label className="text-sm pl-1">{c.name}</Label>
                    {isAdmin(user) ? (
                      <button
                        onClick={() => setPendingDelete(c)}
                        aria-label={`Delete ${c.name} (CAT-002)`}
                        className="rounded-sm p-1 hover:bg-muted-foreground/20"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                  {index < categories.length - 1 ? (
                    <div className="w-full my-2 px-1">
                      <Separator />
                    </div>
                  ) : null}
                </div>
              ))}
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
