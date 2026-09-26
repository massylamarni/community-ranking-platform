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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
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

      {/* CAT-003 — public category list */}
      <Card>
        <CardHeader>
          <CardTitle>Catégories</CardTitle>
          <CardDescription>
            Parcourez les catégories disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listLoading && (
            <p className="text-sm text-muted-foreground">Chargement...</p>
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
            <ul className="flex flex-col gap-2">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <Link
                    href={`/categories/${category.id}`}
                    className="flex-1 hover:underline"
                  >
                    {category.name}
                  </Link>
                  {/* CAT-002 / ADM-001 — admin-only delete action */}
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
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* CAT-002 — delete confirmation modal */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-category-title"
        >
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle id="delete-category-title">
                Supprimer la catégorie ?
              </CardTitle>
              <CardDescription>
                Voulez-vous vraiment supprimer « {pendingDelete.name} » ? Les
                œuvres associées seront conservées.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
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
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}