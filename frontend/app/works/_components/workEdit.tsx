import NoCategory from "@/app/categories/_components/noCategory";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCategory } from "@/contexts/categoryContext";
import { isAdmin, useAuth } from "@/hooks/use-auth";
import { ApiErrorBody, Category, Work } from "@/types/api";
import { FormEvent, useState } from "react";

const DEFAULT_WORK: Work = {
  id: 0,
  title: "",
  description: "",
  imageUrl: "",
  author: { username: "" },
  categories: [],
  status: "created",
  score: 0,
  totalVotes: 0,
  currentUserVote: null,
};

export type WorkFormData = {
  title: string;
  description: string;
  image: File | null;
};

export function WorkEdit({
  work,
  categories,
  errors,
  handleSave,
  handlePublish,
  handleRemove,
}: {
  work: Work | null;
  categories: Category[] | null;
  errors: ApiErrorBody | null;
  handleSave: (data: WorkFormData) => Promise<Work | void>;
  handlePublish?: (categoryIds: number[]) => Promise<void>;
  handleRemove?: () => Promise<void>;
}) {
  const { user } = useAuth();
  const { categories: categoriesForAdmin } = useCategory();
  const isEdit = !!handleRemove;
  const [newWork, setNewWork] = useState<Work>(work ?? DEFAULT_WORK);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    work?.categories ?? [],
  );
  const [image, setImage] = useState<File | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  function toggleSubmitCategory(name: string) {
    setCategoryError("");
    setSelectedCategories((prev) =>
      prev.includes(name)
        ? prev.filter((categoryName) => categoryName !== name)
        : [...prev, name],
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setDeleting(true);
    try {
      await handleSave({
        title: newWork.title,
        description: newWork.description,
        image,
      });
      setPendingDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  async function onPublish() {
    if (!handlePublish) return;
    const categoryIds = (categories ?? [])
      .filter((category) => selectedCategories.includes(category.name))
      .map((category) => category.id);
    if (categoryIds.length === 0) {
      setCategoryError("Select at least one category to publish.");
      return;
    }
    setDeleting(true);
    try {
      const saved = await handleSave({
        title: newWork.title,
        description: newWork.description,
        image,
      });
      if (!saved) return;
      await handlePublish(categoryIds);
    } finally {
      setDeleting(false);
    }
  }

  const fe = errors?.fields ?? {};
  const canEdit =
    !work || work.status === "created" || work.status === "rejected";
  const canPublish =
    work && (work.status === "created" || work.status === "rejected");

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
            {work && !isAdmin(user) && (
              <Field>
                <FieldLabel>Select categories</FieldLabel>
                <ScrollArea className="rounded-md border [&>[data-slot=scroll-area-viewport]]:max-h-72">
                  <div className="flex flex-col gap-2 p-2">
                    {categories?.length ? (
                      categories.map((cat) => (
                        <Field key={cat.id} orientation="horizontal">
                          <Checkbox
                            id={`category-${cat.id}`}
                            name={String(cat.id)}
                            checked={selectedCategories.includes(cat.name)}
                            onCheckedChange={() =>
                              toggleSubmitCategory(cat.name)
                            }
                          />
                          <Label htmlFor={`category-${cat.id}`}>
                            {cat.name}
                          </Label>
                        </Field>
                      ))
                    ) : (
                      <NoCategory />
                    )}
                  </div>
                </ScrollArea>
                {(fe.categoryIds || categoryError) && (
                  <FieldError>{fe.categoryIds ?? categoryError}</FieldError>
                )}
              </Field>
            )}
            {isAdmin(user) && (
              <Field>
                <FieldLabel>Select categories</FieldLabel>
                <ScrollArea className="rounded-md border [&>[data-slot=scroll-area-viewport]]:max-h-72">
                  <div className="flex flex-col gap-2 p-2">
                    {categoriesForAdmin.length ? (
                      categoriesForAdmin.map((cat) => (
                        <Field key={cat.id} orientation="horizontal">
                          <Checkbox
                            id={`category-${cat.id}`}
                            name={String(cat.id)}
                            checked={selectedCategories.includes(cat.name)}
                            onCheckedChange={() =>
                              toggleSubmitCategory(cat.name)
                            }
                          />
                          <Label htmlFor={`category-${cat.id}`}>
                            {cat.name}
                          </Label>
                        </Field>
                      ))
                    ) : (
                      <NoCategory />
                    )}
                  </div>
                </ScrollArea>
                {(fe.categoryIds || categoryError) && (
                  <FieldError>{fe.categoryIds ?? categoryError}</FieldError>
                )}
              </Field>
            )}
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
          <Button
            type="submit"
            variant={isEdit ? "secondary" : "default"}
            disabled={!canEdit || deleting}
          >
            {isEdit ? "Save draft" : "Create draft"}
          </Button>
          {canPublish && handlePublish && (
            <Button type="button" onClick={onPublish} disabled={deleting}>
              Publish
            </Button>
          )}
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
