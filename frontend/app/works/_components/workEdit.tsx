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
import VerticalList from "@/components/vertical-list";
import { useCategory } from "@/contexts/categoryContext";
import { useApi, useWorks } from "@/hooks";
import { isAdmin, useAuth } from "@/hooks/use-auth";
import { Category, Work } from "@/types/api";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const DEFAULT_WORK: Work = {
  id: 0,
  title: "",
  description: "",
  imageUrl: "",
  author: { id: 2, username: "" },
  categories: [],
  status: "created",
  reason: "",
  score: 0,
  totalVotes: 0,
};

export type WorkFormData = {
  title: string;
  description: string;
  image?: File | null;
  categoryIds?: number[];
};

export function WorkEdit({
  type,
  work,
  categories,
}: {
  type: "create" | "edit";
  work: Work | null;
  categories: Category[] | null;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const { run, error, loading } = useApi();
  const { categories: categoriesForAdmin } = useCategory();
  const { submit, update, uploadImage, remove, create } = useWorks();

  const [newWork, setNewWork] = useState<Work>(work ?? DEFAULT_WORK);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    work?.categories ?? [],
  );
  const [image, setImage] = useState<File | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const asAdmin = isAdmin(user);

  const availableCategories = asAdmin ? categoriesForAdmin : (categories ?? []);
  const categoryIds = availableCategories
    .filter((category) => selectedCategories.includes(category.name))
    .map((category) => category.id);

  function toggleSubmitCategory(name: string) {
    setCategoryError("");
    setSelectedCategories((prev) =>
      prev.includes(name)
        ? prev.filter((categoryName) => categoryName !== name)
        : [...prev, name],
    );
  }

  const formData = {
    title: newWork.title,
    description: newWork.description,
    image,
    categoryIds,
  };

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const submitMessage = asAdmin
      ? {
          loading: "Publication de l'œuvre...",
          success: "Œuvre publiée",
          error: "Échec de la publication",
        }
      : {
          loading: "Création du brouillon...",
          success: "Brouillon créé",
          error: "Échec de la création",
        };
    const result = await run(create(formData), submitMessage);
    if (!result.ok) return undefined;
    router.push(`/works/${result.data.id}/edit`);
    return result.data;
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!work) return;
    const result = await run(
      (async () => {
        const updated = await update(work.id, {
          title: formData.title,
          description: formData.description,
          categoryIds: formData.categoryIds,
        });
        return formData.image
          ? await uploadImage(work.id, formData.image)
          : updated;
      })(),
      {
        loading: "Enregistrement du brouillon...",
        success: "Brouillon enregistré",
        error: "Échec de l'enregistrement",
      },
    );
    return result.ok ? result.data : undefined;
  }

  async function handleRemove() {
    if (!work) return;
    const result = await run(remove(work.id), {
      loading: "Suppression...",
      success: "Œuvre supprimé",
      error: "Échec de la suppression",
    });
    if (result.ok) router.push("/works/mine");
  }

  async function handlePublish() {
    if (!work) return;
    if (categoryIds.length === 0) {
      setCategoryError(
        "Sélectionnez au moins une catégorie pour publier l'œuvre.",
      );
      return;
    }
    const result = await run(
      (async () => {
        await submit(work.id, {
          title: formData.title,
          description: formData.description,
          categoryIds: formData.categoryIds ?? [0],
        });
        if (formData.image) await uploadImage(work.id, formData.image);
      })(),
      {
        loading: "Publication de l'œuvre...",
        success: "Œuvre publiée",
        error: "Échec de la publication",
      },
    );
    if (result.ok) router.push("/works/mine");
  }

  const canEdit =
    !work || work.status === "created" || work.status === "rejected";
  const canPublish =
    work && (work.status === "created" || work.status === "rejected");
  const isEdit = type === "edit";

  return (
    <form onSubmit={isEdit ? handleSave : handleCreate} className="w-full">
      <VerticalList>
        <Card>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Titre de l&apos;œuvre</FieldLabel>
                <Input
                  id="work_title"
                  value={newWork?.title}
                  onChange={(e) =>
                    setNewWork((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
                <FieldError>{error?.fields?.title}</FieldError>
              </Field>
              <Field>
                <FieldLabel>Description de l&apos;œuvre</FieldLabel>
                <Input
                  id="work_description"
                  value={newWork?.description}
                  onChange={(e) =>
                    setNewWork((f) => ({ ...f, description: e.target.value }))
                  }
                  required
                />
                <FieldError>{error?.fields?.description}</FieldError>
              </Field>
              {(asAdmin || work) && (
                <Field>
                  <FieldLabel>Sélectionner des catégories</FieldLabel>
                  <ScrollArea className="rounded-md border *:data-[slot=scroll-area-viewport]:max-h-72">
                    <div className="flex flex-col gap-2 p-2">
                      {availableCategories.length ? (
                        availableCategories.map((cat) => (
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
                  <FieldError>
                    {error?.fields?.categoryIds ?? categoryError}
                  </FieldError>
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
              disabled={!canEdit || loading}
            >
              {asAdmin
                ? "Publier"
                : isEdit
                  ? "Enregistrer le brouillon"
                  : "Créer le brouillon"}
            </Button>
            {canPublish && (
              <Button type="button" onClick={handlePublish} disabled={loading}>
                Publier
              </Button>
            )}
          </CardFooter>
        </Card>
        {isEdit && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Supprimer l&apos;œuvre</CardTitle>
                <CardDescription>
                  Supprimez définitivement votre œuvre et tout son contenu de la
                  plateforme. Cette action est irréversible, procédez avec
                  prudence.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setConfirmingDelete(true)}
                >
                  Supprimer l&apos;œuvre
                </Button>
              </CardFooter>
            </Card>
            <ConfirmDialog
              open={!!confirmingDelete}
              onOpenChange={(isOpen) => !isOpen && setConfirmingDelete(false)}
              title="Supprimer l'œuvre ?"
              description={
                <>
                  Voulez-vous vraiment supprimer « {work?.title} » ? Les œuvres
                  associées seront conservées.
                </>
              }
              onConfirm={handleRemove}
              loading={loading}
              error={error?.message}
            />
          </>
        )}
      </VerticalList>
    </form>
  );
}
