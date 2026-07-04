"use client";

import { useState } from "react";
import { Trash2Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAdminActivities, useAdminCreateActivity, useAdminDeleteActivity, useAdminLocationCategories, useAdminModifyActivity } from "@/features/admin/hooks/useAdmin";
import type { AdminCreatePOIRequest, AdminLocationCategoryDTO, AdminModifyPOIRequest } from "@/types";
import {
  type AdminActionState,
  toInputValue,
  parseRequiredNumber,
  parseOptionalNumber,
  useResourceList,
  ResultBlock,
  ActionShell,
  FormInput,
  FormSelect,
  SubmitButton,
} from "../shared";

type ActivityFormState = {
  id?: string;
  category: string;
  name: string;
  lat: string;
  lng: string;
};

const emptyActivityForm: ActivityFormState = {
  id: "",
  category: "",
  name: "",
  lat: "",
  lng: "",
};

function buildActivityPayload(form: ActivityFormState, requireId: boolean): AdminModifyPOIRequest {
  const id = parseOptionalNumber(form.id ?? "");
  if (requireId && !id) {
    throw new Error("Välj en aktivitet eller ange id innan du uppdaterar.");
  }
  const category = form.category.trim();
  if (!category) {
    throw new Error("Välj en kategori.");
  }

  return {
    ...(id ? { id } : {}),
    category,
    name: form.name.trim(),
    lat: parseRequiredNumber(form.lat, "Latitud"),
    lng: parseRequiredNumber(form.lng, "Longitud"),
  };
}

function getActivityCategoryOptions(
  categories: AdminLocationCategoryDTO[],
  selectedCategory: string
) {
  const values = new Set(
    categories
      .map((category) => category.category?.trim())
      .filter((category): category is string => Boolean(category))
  );
  const selected = selectedCategory.trim();
  if (selected) {
    values.add(selected);
  }
  return Array.from(values).sort((left, right) => left.localeCompare(right, "sv"));
}

function ActivityFields({
  form,
  onChange,
  includeId,
  categoryOptions,
  categoriesLoading,
}: {
  form: ActivityFormState;
  onChange: (patch: Partial<ActivityFormState>) => void;
  includeId: boolean;
  categoryOptions: string[];
  categoriesLoading: boolean;
}) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {includeId && <FormInput label="Id" value={form.id ?? ""} onChange={(id) => onChange({ id })} disabled />}
      <FormSelect
        label="Kategori"
        value={form.category}
        onChange={(category) => onChange({ category })}
        disabled={categoriesLoading || categoryOptions.length === 0}
      >
        <option value="">
          {categoriesLoading ? "Hämtar kategorier..." : "Välj kategori"}
        </option>
        {categoryOptions.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </FormSelect>
      <FormInput label="Namn" value={form.name} onChange={(name) => onChange({ name })} />
      <FormInput label="Latitud" value={form.lat} onChange={(lat) => onChange({ lat })} />
      <FormInput label="Longitud" value={form.lng} onChange={(lng) => onChange({ lng })} />
    </div>
  );
}

function ActivitiesForm() {
  const { items, state: listState, refresh } = useResourceList(useAdminActivities());
  const { items: categories, state: categoryState } = useResourceList(useAdminLocationCategories());
  const createActivityMutation = useAdminCreateActivity();
  const modifyActivity = useAdminModifyActivity();
  const deleteActivityMutation = useAdminDeleteActivity();
  const [selectedId, setSelectedId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [deleteState, setDeleteState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState<ActivityFormState>(emptyActivityForm);
  const [createForm, setCreateForm] = useState<ActivityFormState>(emptyActivityForm);
  const categoriesLoading = categoryState.status === "loading";
  const updateCategoryOptions = getActivityCategoryOptions(categories, updateForm.category);
  const createCategoryOptions = getActivityCategoryOptions(categories, createForm.category);

  function selectActivity(id: string) {
    setSelectedId(id);
    const selected = items.find((item) => String(item.id) === id);
    if (!selected) return;
    setUpdateForm({
      id: toInputValue(selected.id),
      category: selected.category ?? "",
      name: selected.name ?? "",
      lat: toInputValue(selected.lat),
      lng: toInputValue(selected.lng),
    });
  }

  async function save(action: "create" | "update") {
    const source = action === "create" ? createForm : updateForm;
    const setState = action === "create" ? setCreateState : setUpdateState;
    setState({
      status: "loading",
      message: action === "create" ? "Skapar aktivitet..." : "Uppdaterar aktivitet...",
    });

    try {
      if (action === "create") {
        await createActivityMutation.mutateAsync(
          buildActivityPayload(source, false) as AdminCreatePOIRequest,
        );
        setCreateForm(emptyActivityForm);
      } else {
        await modifyActivity.mutateAsync(buildActivityPayload(source, true));
      }
      setState({
        status: "success",
        message: action === "create" ? "Aktiviteten skapades." : "Aktiviteten uppdaterades.",
      });
      await refresh();
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Aktiviteten kunde inte sparas.",
      });
    }
  }

  async function deleteActivity() {
    const id = parseOptionalNumber(deleteId);
    if (!id) {
      setDeleteState({ status: "error", message: "Välj en aktivitet att ta bort." });
      return;
    }

    setDeleteState({ status: "loading", message: "Tar bort aktivitet..." });
    try {
      await deleteActivityMutation.mutateAsync(id);
      setDeleteId("");
      setDeleteState({ status: "success", message: "Aktiviteten togs bort." });
      await refresh();
    } catch (error) {
      setDeleteState({
        status: "error",
        message: error instanceof Error ? error.message : "Aktiviteten kunde inte tas bort.",
      });
    }
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Hämta och uppdatera aktivitet"
        description="GET hämtar alla aktiviteter. Välj en aktivitet och uppdatera den med PUT."
        method="GET/PUT"
        endpoint="/api/admin/activities, /api/admin/activity"
      >
        <ResultBlock state={listState} />
        <ResultBlock state={categoryState} />
        <FormSelect label="Välj befintlig aktivitet" value={selectedId} onChange={selectActivity}>
          <option value="">Välj aktivitet</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {[item.name, item.category, item.id].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <ActivityFields
          form={updateForm}
          onChange={(patch) => setUpdateForm((current) => ({ ...current, ...patch }))}
          includeId
          categoryOptions={updateCategoryOptions}
          categoriesLoading={categoriesLoading}
        />
        <SubmitButton isLoading={updateState.status === "loading"} onPress={() => void save("update")} disabled={!updateForm.id?.trim()}>
          Uppdatera vald
        </SubmitButton>
        <ResultBlock state={updateState} />
      </ActionShell>

      <ActionShell
        title="Skapa ny aktivitet"
        description="POST är separat och skapar en ny aktivitet."
        method="POST"
        endpoint="/api/admin/activity"
      >
        <ResultBlock state={categoryState} />
        <ActivityFields
          form={createForm}
          onChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))}
          includeId={false}
          categoryOptions={createCategoryOptions}
          categoriesLoading={categoriesLoading}
        />
        <SubmitButton isLoading={createState.status === "loading"} onPress={() => void save("create")} disabled={!createForm.category.trim()}>
          Skapa
        </SubmitButton>
        <ResultBlock state={createState} />
      </ActionShell>

      <ActionShell
        title="Ta bort aktivitet"
        description="Välj en aktivitet från GET-resultatet och ta bort den med delete-endpointen."
        method="PUT"
        endpoint="/api/admin/activity/delete"
      >
        <FormSelect label="Välj aktivitet" value={deleteId} onChange={setDeleteId}>
          <option value="">Välj aktivitet</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {[item.name, item.category, item.id].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <Button
          type="button"
          isLoading={deleteState.status === "loading"}
          isDisabled={!deleteId}
          onPress={() => void deleteActivity()}
          variant="destructive"
          className="mt-4 bg-red-700 text-white hover:bg-red-800"
        >
          <Trash2Icon className="h-4 w-4" />
          Ta bort valda
        </Button>
        <ResultBlock state={deleteState} />
      </ActionShell>
    </div>
  );
}

export default ActivitiesForm;
