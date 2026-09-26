import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Category, Work } from "@/types/api";
import { FormEvent, useState } from "react";
import { AttachmentUploader } from "./attachmentUploader";

const DEFAULT_WORK: Work = {
  id: "",
  title: "",
  description: "",
  imageUrl: "",
  author: { username: "" },
  categories: [],
  status: "pending",
  score: 0,
  totalVotes: 0,
  currentUserVote: null,
};

export type WorkFormData = {
  // TODO
  title: string;
  description: string;
  categoryIds: string[];
  image: File | null;
};

export function WorkEdit({
  work,
  categories,
  handleSave,
  handleRemove,
}: {
  work: Work | null;
  categories: Category[] | null;
  handleSave: (data: WorkFormData) => Promise<void>;
  handleRemove?: () => Promise<void>;
}) {
  const isEdit = !!handleRemove;
  const [newWork, setNewWork] = useState<Work>(work ?? DEFAULT_WORK);
  const [categoryIds, setCategoryIds] = useState<string[]>(
    work?.categories.map((c) => c.id) ?? [],
  );
  const [image, setImage] = useState<File | null>(null);

  function toggleSubmitCategory(id: string) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    handleSave({
      title: newWork.title,
      description: newWork?.description,
      categoryIds,
      image,
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="relative w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <Field>
              <FieldLabel>Work title</FieldLabel>
              <Input
                id="work_title"
                value={newWork?.title}
                onChange={(e) =>
                  setNewWork((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </Field>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Work description</FieldLabel>
              <Input
                id="work_description"
                value={newWork?.description}
                onChange={(e) =>
                  setNewWork((f) => ({ ...f, description: e.target.value }))
                }
                required
              />
            </Field>
            {categories?.map((cat) => (
              <Field key={cat.id} orientation="horizontal">
                <Checkbox
                  id={cat.id}
                  name={cat.id}
                  checked={categoryIds.includes(cat.id)}
                  onCheckedChange={() => toggleSubmitCategory(cat.id)}
                />
                <Label htmlFor={cat.id}>{cat.name}</Label>
              </Field>
            ))}
            <AttachmentUploader
              onFileSelect={setImage}
              initialAttachment={
                work?.imageUrl
                  ? { name: work.title, url: work.imageUrl }
                  : undefined
              }
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          {isEdit && (
            <Button type="button" variant="destructive" onClick={handleRemove}>
              Delete
            </Button>
          )}
          <Button type="submit">{isEdit ? "Save" : "Create"}</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
