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
  periods: string[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onReset: () => void;
  loading?: boolean;
}

function formatPeriodLabel(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const start = new Date(Date.UTC(year, month - 1, day));
    const end = new Date(Date.UTC(year, month - 1, day + 6));
    const startFormatted = `${String(start.getUTCDate()).padStart(2, "0")}/${String(start.getUTCMonth() + 1).padStart(2, "0")}/${start.getUTCFullYear()}`;
    const endFormatted = `${String(end.getUTCDate()).padStart(2, "0")}/${String(end.getUTCMonth() + 1).padStart(2, "0")}/${end.getUTCFullYear()}`;
    return `Semaine du ${startFormatted} au ${endFormatted}`;
  } catch {
    return dateStr;
  }
}

export default function RankingArchiveFilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  periods,
  selectedPeriod,
  onPeriodChange,
  onSubmit,
  onReset,
  loading = false,
}: RankingArchiveFilterBarProps) {
  const categoryItems = [
    { label: "Toutes les catégories", value: "all" },
    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  const periodItems =
    periods.length > 0
      ? periods.map((p) => ({
          label: formatPeriodLabel(p),
          value: p,
        }))
      : selectedPeriod
        ? [{ label: formatPeriodLabel(selectedPeriod), value: selectedPeriod }]
        : [{ label: "Aucune période disponible", value: "none" }];

  const defaultPeriod = periods[0] ?? "";
  const hasActiveFilters =
    selectedCategory !== "all" ||
    (Boolean(selectedPeriod) && selectedPeriod !== defaultPeriod);

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 w-full">
      <FieldGroup className="w-80 sm:w-82.5">
        <Field>
          <Label
            htmlFor="period-select"
            className="text-xs font-medium text-muted-foreground"
          >
            Période archivée
          </Label>
          <Select
            items={periodItems}
            value={selectedPeriod || defaultPeriod}
            onValueChange={(val) => onPeriodChange(val ?? defaultPeriod)}
            disabled={loading || periods.length === 0}
          >
            <SelectTrigger
              id="period-select"
              aria-label="Période archivée"
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={true}>
              <SelectGroup>
                {periodItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

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
          aria-label="Filtrer"
        >
          <Filter className="size-4" />
          Filtrer
        </Button>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
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
