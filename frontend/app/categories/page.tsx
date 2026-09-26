"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth, isAdmin } from "@/context/AuthContext";
import { categoriesRepository } from "@/repositories";
import { ApiError } from "@/lib/errors";
import type { Category } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function CategoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const admin = isAdmin(user);

  const [categories, setCategories] = useState<Category[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // CAT-002 — delete confirmation state
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await categoriesRepository.list();
      setCategories(data);
    } catch (err) {
      setListError(
        err instanceof ApiError
          ? err.message
          : "Impossible de charger les catégories.",
      );
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setFormError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setFieldError("Le nom de la catégorie est requis.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await categoriesRepository.create({ name: trimmed });
      setCategories((prev) => [...prev, created]);
      setName("");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isValidation && err.fields?.name) {
          setFieldError(err.fields.name);
        } else if (err.isForbidden) {
          setFormError("Vous n'avez pas les droits nécessaires.");
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError("Une erreur inattendue est survenue.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await categoriesRepository.remove(pendingDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isForbidden) {
          setDeleteError("Vous n'avez pas les droits nécessaires.");
        } else if (err.isNotFound) {
          setDeleteError("Cette catégorie n'existe plus.");
        } else {
          setDeleteError(err.message);
        }
      } else {
        setDeleteError("Une erreur inattendue est survenue.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      {/* Page header — dashboard-panel style */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Catégories</h1>
        <p className="text-sm text-muted-foreground">
          Parcourez les catégories disponibles et retrouvez les œuvres
          associées.
        </p>
      </div>

      {/* CAT-001 / ADM-001 — admin-only creation form */}
      {!authLoading && admin && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une catégorie</CardTitle>
            <CardDescription>
              Les catégories permettent de classer les œuvres.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="flex flex-col gap-2">
              <Label htmlFor="category-name">Nom de la catégorie</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Photographie"
                disabled={submitting}
              />
              {fieldError && (
                <p className="text-sm text-destructive">{fieldError}</p>
              )}
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Création..." : "Créer"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* CAT-003 — public category list, dashboard-style table */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les catégories</CardTitle>
          <CardDescription>
            {listLoading
              ? "Chargement..."
              : `${categories.length} catégorie${categories.length > 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listLoading && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {!listLoading && listError && (
            <p className="text-sm text-destructive">{listError}</p>
          )}

          {!listLoading && !listError && categories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucune catégorie pour le moment.
            </p>
          )}

          {!listLoading && !listError && categories.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="w-1 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Link
                        href={`/categories/${category.id}`}
                        className="inline-flex"
                      >
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                        >
                          {category.name}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      {!authLoading && admin && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeleteError(null);
                            setPendingDelete(category);
                          }}
                        >
                          Supprimer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* CAT-002 — delete confirmation dialog */}
      <Dialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la catégorie ?</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer « {pendingDelete?.name} » ? Les
              œuvres associées seront conservées.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setPendingDelete(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}