"use client";

import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import type { Category } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RankingArchiveFilterBarProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onReset: () => void;
  loading?: boolean;
}

export default function RankingArchiveFilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  onSubmit,
  onReset,
  loading = false,
}: RankingArchiveFilterBarProps) {
  const categoryItems = [
    { label: "Toutes les catégories", value: "all" },
    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  const hasActiveFilters = selectedCategory !== "all";

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-wrap items-end gap-3 w-full"
    >
      <FieldGroup className="w-48 sm:w-56">
        <Field>
          <Label
            htmlFor="category-select"
            className="text-xs font-medium text-muted-foreground"
          >
            Catégorie
          </Label>
          <Select
            items={categoryItems}
            value={selectedCategory}
            onValueChange={(val) => onCategoryChange(val ?? "all")}
            disabled={loading}
          >
            <SelectTrigger
              id="category-select"
              aria-label="Catégorie"
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={true}>
              <SelectGroup>
                {categoryItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={loading}
          className="gap-1.5"
          aria-label="Valider les filtres"
        >
          <Filter className="size-4" />
          Valider
        </Button>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onReset}
            className="gap-1.5"
            aria-label="Réinitialiser les filtres"
          >
            <RotateCcw className="size-4" />
            Réinitialiser
          </Button>
        )}
      </div>
    </form>
  );
}
