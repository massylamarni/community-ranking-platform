import { Category } from "@/types/api";
import { Dispatch, SetStateAction } from "react";

import { Field, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isAdmin, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FilterBar({
  categories,
  categoryId,
  setCategoryId,
}: {
  categories: Category[];
  categoryId: string;
  setCategoryId: Dispatch<SetStateAction<string>>;
}) {
  const { user } = useAuth();

  return (
    <div className="flex w-full justify-between">
      {categories ? (
        <FieldGroup className="w-full max-w-xs">
          <Field>
            <Select
              items={categories.map((category) => ({
                label: category.name,
                value: String(category.id),
              }))}
              value={categoryId}
              onValueChange={(cat) => setCategoryId(cat ?? categoryId)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={true}>
                <SelectGroup>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      ) : (
        <div></div>
      )}
      {isAdmin(user) && (
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/categories/edit" />}
        >
          Edit
        </Button>
      )}
    </div>
  );
}
