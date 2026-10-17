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

export type RankingArchiveSortOption =
  | "date_desc"
  | "date_asc"
  | "score_desc"
  | "score_asc";

export interface RankingArchiveFilterBarProps {
  categories: Category[];
  availablePeriods: string[];
  selectedPeriodStart: string;
  selectedCategory: string;
  selectedSort: RankingArchiveSortOption;
  onPeriodStartChange: (periodStart: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: RankingArchiveSortOption) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onReset: () => void;
  loading?: boolean;
}

function formatPeriodOption(dateStr: string): string {
  if (!dateStr || dateStr === "latest") return "Dernière semaine clôturée";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const end = new Date(Date.UTC(year, month - 1, day + 6));
    const endD = String(end.getUTCDate()).padStart(2, "0");
    const endM = String(end.getUTCMonth() + 1).padStart(2, "0");
    const endY = end.getUTCFullYear();
    const startD = String(day).padStart(2, "0");
    const startM = String(month).padStart(2, "0");
    return `Semaine du ${startD}/${startM} (fin: ${endD}/${endM}/${endY})`;
  } catch {
    return dateStr;
  }
}

const SORT_OPTIONS: { label: string; value: RankingArchiveSortOption }[] = [
  { label: "Date : plus récente à plus ancienne", value: "date_desc" },
  { label: "Date : plus ancienne à plus récente", value: "date_asc" },
  { label: "Score : du plus élevé au plus faible", value: "score_desc" },
  { label: "Score : du plus faible au plus élevé", value: "score_asc" },
];

export default function RankingArchiveFilterBar({
  categories,
  availablePeriods,
  selectedPeriodStart,
  selectedCategory,
  selectedSort,
  onPeriodStartChange,
  onCategoryChange,
  onSortChange,
  onSubmit,
  onReset,
  loading = false,
}: RankingArchiveFilterBarProps) {
  const categoryItems = [
    { label: "Toutes les catégories", value: "all" },
    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  const periodItems = [
    { label: "Dernière semaine clôturée", value: "latest" },
    ...availablePeriods.map((dateStr) => ({
      label: formatPeriodOption(dateStr),
      value: dateStr,
    })),
  ];

  const hasActiveFilters =
    (selectedPeriodStart !== "" && selectedPeriodStart !== "latest") ||
    selectedCategory !== "all" ||
    selectedSort !== "date_desc";

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-wrap items-end gap-3 w-full"
    >
      <FieldGroup className="w-64 sm:w-72">
        <Field>
          <Label
            htmlFor="period-start-select"
            className="text-xs font-medium text-muted-foreground"
          >
            Période clôturée
          </Label>
          <Select
            items={periodItems}
            value={selectedPeriodStart || "latest"}
            onValueChange={(val) => onPeriodStartChange(val ?? "latest")}
            disabled={loading}
          >
            <SelectTrigger
              id="period-start-select"
              aria-label="Période clôturée"
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

      <FieldGroup className="w-56 sm:w-64">
        <Field>
          <Label
            htmlFor="sort-select"
            className="text-xs font-medium text-muted-foreground"
          >
            Trier par
          </Label>
          <Select
            items={SORT_OPTIONS}
            value={selectedSort}
            onValueChange={(val) =>
              onSortChange((val as RankingArchiveSortOption) ?? "date_desc")
            }
            disabled={loading}
          >
            <SelectTrigger
              id="sort-select"
              aria-label="Trier par"
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={true}>
              <SelectGroup>
                {SORT_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <FieldGroup className="w-44 sm:w-52">
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
