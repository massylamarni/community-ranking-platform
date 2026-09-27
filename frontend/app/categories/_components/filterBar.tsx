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
import { isAdmin, useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CategoriesManager from "./categoriesManager";

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
    <div className="flex">
      <FieldGroup className="w-full max-w-xs">
        <Field>
          <Select
            items={categories.map((category) => ({
              label: category.name,
              value: category.id,
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
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      {isAdmin(user) && (
        <Dialog>
          <DialogTrigger render={<Button variant="outline">Edit</Button>} />
          <DialogContent showCloseButton={false} className="p-0 w-xs">
            <CategoriesManager />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
