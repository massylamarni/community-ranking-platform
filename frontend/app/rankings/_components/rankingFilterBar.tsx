"use client";

import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import type { Category, RankingPeriod } from "@/types/api";
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

export interface RankingFilterBarProps {
  categories: Category[];
  selectedCategory: string;
  selectedPeriod: RankingPeriod;
  onCategoryChange: (category: string) => void;
  onPeriodChange: (period: RankingPeriod) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onReset: () => void;
  loading?: boolean;
}

const PERIOD_OPTIONS: { label: string; value: RankingPeriod }[] = [
  { label: "Toutes les périodes", value: "all" },
  { label: "Aujourd'hui", value: "day" },
  { label: "Cette semaine", value: "week" },
  { label: "Ce mois-ci", value: "month" },
];

export default function RankingFilterBar({
  categories,
  selectedCategory,
  selectedPeriod,
  onCategoryChange,
  onPeriodChange,
  onSubmit,
  onReset,
  loading = false,
}: RankingFilterBarProps) {
  const categoryItems = [
    { label: "Toutes les catégories", value: "all" },
    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  const hasActiveFilters =
    selectedCategory !== "all" || selectedPeriod !== "all";

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

      <FieldGroup className="w-48 sm:w-56">
        <Field>
          <Label
            htmlFor="period-select"
            className="text-xs font-medium text-muted-foreground"
          >
            Période
          </Label>
          <Select
            items={PERIOD_OPTIONS}
            value={selectedPeriod}
            onValueChange={(val) =>
              onPeriodChange((val as RankingPeriod) ?? "all")
            }
            disabled={loading}
          >
            <SelectTrigger
              id="period-select"
              aria-label="Période"
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={true}>
              <SelectGroup>
                {PERIOD_OPTIONS.map((item) => (
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
