"use client";

import { useMemo, useState } from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "@/components/icons";
import { APP_ICON_CATEGORIES, filterAppIconOptions, getAppIconOption, type AppIconCategory } from "@/components/icons/catalog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAdminCreateTag, useAdminModifyTag, useAdminTags } from "@/features/admin/hooks/useAdmin";
import {
  type AdminActionState,
  parseListInput,
  useResourceList,
  ResultBlock,
  ActionShell,
  FormInput,
  FormTextarea,
  FormSelect,
  SubmitButton,
} from "../shared";

type TagFormState = {
  tag: string;
  displayName: string;
  icon: string;
  tagValues: string;
};

function TagIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AppIconCategory | "all">("all");
  const selected = getAppIconOption(value);
  const filteredIcons = useMemo(
    () => filterAppIconOptions(query, category),
    [category, query]
  );

  return (
    <div className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 md:col-span-2">
      <span>Ikon</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left normal-case tracking-normal text-gray-950 shadow-theme-xs transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-brand-50 text-brand-500">
                {selected ? (
                  <selected.Icon className="h-5 w-5" />
                ) : (
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {selected?.label ?? (value.trim() || "Välj ikon")}
                </span>
                <span className="block truncate text-xs font-medium text-gray-500">
                  {selected?.name ?? (value.trim() || "Ingen ikon vald")}
                </span>
              </span>
            </span>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(92vw,720px)] overflow-hidden portal-surface p-0 shadow-theme-lg"
        >
          <div className="border-b border-gray-200 bg-gray-50 p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
              <label className="relative block">
                <span className="sr-only">Sök ikon</span>
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Sök ikon..."
                  className="h-10 rounded-lg border-gray-200 bg-white pl-9 normal-case tracking-normal text-gray-950 shadow-theme-xs"
                />
              </label>
              <label>
                <span className="sr-only">Filtrera på typ</span>
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as AppIconCategory | "all")
                  }
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-gray-950 shadow-theme-xs outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                >
                  <option value="all">Alla typer</option>
                  {APP_ICON_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs normal-case tracking-normal text-gray-500">
              <span>
                {filteredIcons.length} ikon{filteredIcons.length === 1 ? "" : "er"}
              </span>
              {value.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  Rensa
                </button>
              )}
            </div>
          </div>
          <div className="max-h-[420px] overflow-y-auto p-2">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                {filteredIcons.map((icon) => {
                  const isSelected = selected?.name === icon.name;
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => {
                        onChange(icon.name);
                        setOpen(false);
                      }}
                      className={`flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-left normal-case tracking-normal transition ${
                        isSelected
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-transparent bg-white text-gray-950 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <icon.Icon
                        className={`h-5 w-5 shrink-0 ${isSelected ? "text-white" : "text-brand-500"}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {icon.label}
                        </span>
                        <span
                          className={`block truncate text-[11px] font-medium ${
                            isSelected ? "text-white/75" : "text-gray-500"
                          }`}
                        >
                          {icon.name}
                        </span>
                      </span>
                      {isSelected && <CheckIcon className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-8 text-center text-sm normal-case tracking-normal text-gray-500">
                Ingen ikon matchar sökningen.
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function TagsFormFields({
  form,
  onChange,
  includeValues,
  lockTag = false,
}: {
  form: TagFormState;
  onChange: (patch: Partial<TagFormState>) => void;
  includeValues: boolean;
  lockTag?: boolean;
}) {
  return (
    <>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FormInput label="Tagg" value={form.tag} onChange={(tag) => onChange({ tag })} disabled={lockTag} />
        <FormInput
          label="Visningsnamn"
          value={form.displayName}
          onChange={(displayName) => onChange({ displayName })}
        />
        <TagIconPicker value={form.icon} onChange={(icon) => onChange({ icon })} />
      </div>
      {includeValues && (
        <div className="mt-3">
          <FormTextarea
            label="Tillåtna värden"
            value={form.tagValues}
            onChange={(tagValues) => onChange({ tagValues })}
            placeholder="En per rad, eller kommaseparerat"
          />
        </div>
      )}
    </>
  );
}

function TagsForm() {
  const { items, state: listState, refresh } = useResourceList(useAdminTags());
  const modifyTag = useAdminModifyTag();
  const createTagMutation = useAdminCreateTag();
  const [selectedTag, setSelectedTag] = useState("");
  const [updateState, setUpdateState] = useState<AdminActionState>({ status: "idle" });
  const [createState, setCreateState] = useState<AdminActionState>({ status: "idle" });
  const [updateForm, setUpdateForm] = useState<TagFormState>({
    tag: "",
    displayName: "",
    icon: "",
    tagValues: "",
  });
  const [createForm, setCreateForm] = useState<TagFormState>({
    tag: "",
    displayName: "",
    icon: "",
    tagValues: "",
  });

  function selectTag(tag: string) {
    setSelectedTag(tag);
    const selected = items.find((item) => item.tag === tag);
    if (!selected) return;
    setUpdateForm({
      tag: selected.tag ?? "",
      displayName: selected.displayName ?? "",
      icon: selected.icon ?? "",
      tagValues: (selected.tagValues ?? []).join("\n"),
    });
  }

  async function updateTag() {
    setUpdateState({ status: "loading", message: "Uppdaterar tagg..." });
    try {
      await modifyTag.mutateAsync({
        tag: updateForm.tag.trim(),
        displayName: updateForm.displayName.trim(),
        icon: updateForm.icon.trim(),
        tagValues: parseListInput(updateForm.tagValues),
      });
      // The mutation already invalidates qk.admin.tags + qk.listings.tags;
      // the explicit refresh stays for now so the section's own listState
      // transitions show the loading flash users are used to.
      setUpdateState({ status: "success", message: "Taggen uppdaterades." });
      await refresh();
    } catch (error) {
      setUpdateState({
        status: "error",
        message: error instanceof Error ? error.message : "Kunde inte uppdatera taggen.",
      });
    }
  }

  async function createTag() {
    setCreateState({ status: "loading", message: "Skapar tagg..." });
    try {
      await createTagMutation.mutateAsync({
        tag: createForm.tag.trim(),
        displayName: createForm.displayName.trim(),
        icon: createForm.icon.trim(),
        tagValues: parseListInput(createForm.tagValues),
      });
      setCreateForm({ tag: "", displayName: "", icon: "", tagValues: "" });
      setCreateState({ status: "success", message: "Taggen skapades." });
      await refresh();
    } catch (error) {
      setCreateState({
        status: "error",
        message: error instanceof Error ? error.message : "Kunde inte skapa taggen.",
      });
    }
  }

  return (
    <div className="grid gap-4">
      <ActionShell
        title="Hämta och uppdatera tagg"
        description="Välj en tagg från GET-resultatet. PUT uppdaterar bara den valda posten."
        method="GET/PUT"
        endpoint="/api/admin/tags, /api/admin/tag"
      >
        <ResultBlock state={listState} />
        <FormSelect label="Välj befintlig tagg" value={selectedTag} onChange={selectTag}>
          <option value="">Välj tagg</option>
          {items.map((item) => (
            <option key={item.tag} value={item.tag}>
              {[item.displayName, item.tag].filter(Boolean).join(" - ")}
            </option>
          ))}
        </FormSelect>
        <TagsFormFields form={updateForm} onChange={(patch) => setUpdateForm((current) => ({ ...current, ...patch }))} includeValues lockTag />
        <SubmitButton isLoading={updateState.status === "loading"} onPress={updateTag} disabled={!updateForm.tag.trim()}>
          Uppdatera vald
        </SubmitButton>
        <ResultBlock state={updateState} />
      </ActionShell>

      <ActionShell
        title="Skapa ny tagg"
        description="POST är separat och skapar en ny post."
        method="POST"
        endpoint="/api/admin/tag"
      >
        <TagsFormFields form={createForm} onChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))} includeValues />
        <SubmitButton isLoading={createState.status === "loading"} onPress={createTag} disabled={!createForm.tag.trim()}>
          Skapa
        </SubmitButton>
        <ResultBlock state={createState} />
      </ActionShell>
    </div>
  );
}

export default TagsForm;
