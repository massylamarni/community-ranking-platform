import { Category } from "@/types/api";

import { Field, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export default function FilterBar({
  categories,
  categoryId,
  setCategoryId,
}: {
  categories: Category[];
  categoryId: string;
  setCategoryId: (id: string) => void;
}) {
  return (
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
  );
}
