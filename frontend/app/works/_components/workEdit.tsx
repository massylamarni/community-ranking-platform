import { AttachmentUploader } from "@/components/attachmentUploader";
import { ConfirmDialog } from "@/components/confirmDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiErrorBody, Category, Work } from "@/types/api";
import { FormEvent, useState } from "react";

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

const DEFAULT_CATEGORY = "Uncategorized";

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
  errors,
  handleSave,
  handleRemove,
}: {
  work: Work | null;
  categories: Category[] | null;
  errors: ApiErrorBody | null;
  handleSave: (data: WorkFormData) => Promise<void>;
  handleRemove?: () => Promise<void>;
}) {
  const isEdit = !!handleRemove;
  const [newWork, setNewWork] = useState<Work>(work ?? DEFAULT_WORK);
  const [categoryIds, setCategoryIds] = useState<string[]>(
    work?.categories.map((c) => c.id) ?? [DEFAULT_CATEGORY],
  );
  const [image, setImage] = useState<File | null>(null);

  const [pendingDelete, setPendingDelete] = useState<boolean>(false);
  const [deleting, setDeleting] = useState(false);

  function toggleSubmitCategory(id: string) {
    setCategoryIds((prev) => {
      const withoutUncategorized = prev.filter((c) => c !== DEFAULT_CATEGORY);
      const next = withoutUncategorized.includes(id)
        ? withoutUncategorized.filter((c) => c !== id)
        : [...withoutUncategorized, id];

      return next.length === 0 ? [DEFAULT_CATEGORY] : next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    setDeleting(true);
    try {
      await handleSave({
        title: newWork.title,
        description: newWork?.description,
        categoryIds,
        image,
      });
      setPendingDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  const fe = errors?.fields ?? {};

  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
      <Card>
        <CardContent>
          <FieldGroup>
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
              {fe.title && <FieldError>{fe.title}</FieldError>}
            </Field>
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
              {fe.description && <FieldError>{fe.description}</FieldError>}
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
                {fe.username && <FieldError>{fe.username}</FieldError>}
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
        <CardFooter>
          <Button type="submit">{isEdit ? "Save" : "Create"}</Button>
        </CardFooter>
      </Card>
      {isEdit && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Delete Work</CardTitle>
              <CardDescription>
                Permanently remove your work and all of its contents from the
                Vercel platform. This action is not reversible, so please
                continue with caution.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setPendingDelete(true)}
              >
                Delete work
              </Button>
            </CardFooter>
          </Card>
          <ConfirmDialog
            open={!!pendingDelete}
            onOpenChange={(isOpen) => !isOpen && setPendingDelete(false)}
            title="Supprimer la catégorie ?"
            description={
              <>
                Voulez-vous vraiment supprimer « {work?.title} » ? Les œuvres
                associées seront conservées.
              </>
            }
            onConfirm={handleRemove}
            loading={deleting}
            error={errors}
          />
        </>
      )}
    </form>
  );
}
