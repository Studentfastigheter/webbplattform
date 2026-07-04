"use client";

import { useState } from "react";
import { useAdminLocationCategories, useAdminModifyLocationCategory, useAdminAddLocationCategory } from "@/features/admin/hooks/useAdmin";
import type { AdminLocationCategoryDTO } from "@/types";
import {
  type AdminActionState,
  useResourceList,
  ResultBlock,
  ActionShell,
  FormInput,
  FormSelect,
  SubmitButton,
} from "../shared";

function LocationCategoriesForm() {
  const { items, state: listState, refresh } = useResourceList(useAdminLocationCategories());
  const addLocationCategory = useAdminAddLocationCategory();
  const modifyLocationCategory = useAdminModifyLocationCategory();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState({ category: "", googleType: "" });
  const [createForm, setCreateForm] = useState({ category: "", googleType: "" });

  function selectCategory(category: string) {
    setSelectedCategory(category);
    const selected = items.find((item) => item.category === category);
    if (!selected) return;
    setUpdateForm({
      category: selected.category ?? "",
      googleType: selected.googleType ?? "",
    });
  }

  async function save(action: "create" | "update") {
    const source = action === "create" ? createForm : updateForm;
    const setState = action === "create" ? setCreateState : setUpdateState;
    setState({
      status: "loading",
      message: action === "create" ? "Skapar kategori..." : "Uppdaterar kategori...",
    });

    try {
      const payload: AdminLocationCategoryDTO = {
        category: source.category.trim(),
        googleType: source.googleType.trim(),
      };
      if (action === "create") {
        await addLocationCategory.mutateAsync(payload);
        setCreateForm({ category: "", googleType: "" });
      } else {
        await modifyLocationCategory.mutateAsync(payload);
      }
      setState({
        status: "success",
        message: action === "create" ? "Kategorin skapades." : "Kategorin uppdaterades.",
      });
      await refresh();
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Kategorin kunde inte sparas.",
      });
    }
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Hämta och uppdatera platskategori"
        description="GET hämtar alla kategorier. Välj en kategori och uppdatera den med PUT."
        method="GET/PUT"
        endpoint="/api/admin/location-categories, /api/admin/location-category"
      >
        <ResultBlock state={listState} />
        <FormSelect label="Välj befintlig kategori" value={selectedCategory} onChange={selectCategory}>
          <option value="">Välj kategori</option>
          {items.map((item) => (
            <option key={item.category} value={item.category}>
              {[item.category, item.googleType].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <FormInput
            label="Kategori"
            value={updateForm.category}
            onChange={() => undefined}
            disabled
          />
          <FormInput label="Google type" value={updateForm.googleType} onChange={(googleType) => setUpdateForm((current) => ({ ...current, googleType }))} />
        </div>
        <SubmitButton isLoading={updateState.status === "loading"} onPress={() => void save("update")} disabled={!updateForm.category.trim()}>
          Uppdatera vald
        </SubmitButton>
        <ResultBlock state={updateState} />
      </ActionShell>

      <ActionShell
        title="Skapa ny platskategori"
        description="POST är separat och skapar en ny kategori."
        method="POST"
        endpoint="/api/admin/location-category"
      >
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <FormInput label="Kategori" value={createForm.category} onChange={(category) => setCreateForm((current) => ({ ...current, category }))} />
          <FormInput label="Google type" value={createForm.googleType} onChange={(googleType) => setCreateForm((current) => ({ ...current, googleType }))} />
        </div>
        <SubmitButton isLoading={createState.status === "loading"} onPress={() => void save("create")}>
          Skapa
        </SubmitButton>
        <ResultBlock state={createState} />
      </ActionShell>
    </div>
  );
}

export default LocationCategoriesForm;
