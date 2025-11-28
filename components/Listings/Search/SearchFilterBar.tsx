"use client";

import { Button } from "@heroui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

export type Option = {
  label: string;
  value: string;
};

type FieldBase = {
  id: string;
  label: string; // "Var", "Hyresvärd", "Pris"
  placeholder: string; // "Sök studentstad", "Välj hyresvärd", ...
};

type SelectField = FieldBase & {
  type: "select";
  options: Option[];
  searchable?: boolean;
  multiple?: boolean; // true = flera val möjliga
};

type SearchField = FieldBase & {
  type: "search";
  options?: Option[]; // valfria förslag i dropdown
};

export type FilterField = SelectField | SearchField;

// Ett fält kan ha sträng, lista av strängar eller null
export type FieldValue = string | string[] | null;

export type SearchFilterBarProps = {
  fields: FilterField[];
  values?: Record<string, FieldValue>;
  onChange?: (values: Record<string, FieldValue>) => void;
  onSubmit?: (values: Record<string, FieldValue>) => void;
  className?: string;
};

// Hur texten ska visas i rutan
const getDisplayValue = (field: FilterField, value: FieldValue): string => {
  if (field.type === "select" && field.multiple) {
    if (!value) return "";

    const arr = Array.isArray(value) ? value : [value];

    if (arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    return `${arr.length} valda`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "";
    if (value.length === 1) return value[0];
    return value.join(", ");
  }

  return value ?? "";
};

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  fields,
  values: controlledValues,
  onChange,
  onSubmit,
  className = "",
}) => {
  const [internalValues, setInternalValues] = useState<Record<string, FieldValue>>({});
  const [openFieldId, setOpenFieldId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  const values = controlledValues ?? internalValues;
  const isSingleFieldMode = fields.length === 1;

  const rootRef = useRef<HTMLDivElement | null>(null);

  // Stäng dropdown vid klick utanför
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenFieldId(null);
        setSearchTerm("");
        setIsFiltering(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const setValue = (fieldId: string, value: FieldValue) => {
    const next = { ...values, [fieldId]: value };
    if (!controlledValues) setInternalValues(next);
    onChange?.(next);
  };

  const activeField: FilterField | null = useMemo(() => {
    if (isSingleFieldMode) {
      return fields[0] ?? null;
    }
    return fields.find((f) => f.id === openFieldId) ?? null;
  }, [fields, isSingleFieldMode, openFieldId]);

  const filteredOptions: Option[] = useMemo(() => {
    if (!activeField) return [];

    const baseOptions =
      activeField.type === "select" ? activeField.options : activeField.options ?? [];

    if (!isFiltering || !searchTerm.trim()) return baseOptions;

    const term = searchTerm.toLowerCase();
    return baseOptions.filter((o) => o.label.toLowerCase().includes(term));
  }, [activeField, isFiltering, searchTerm]);

  const handleSubmit = () => {
    onSubmit?.(values);
  };

  return (
    <div ref={rootRef} className={`relative w-full ${className}`}>
      <div
        className="
          relative
          flex h-[58.5px] w-full items-center
          rounded-[29.25px] border border-black/10
          bg-white shadow-[0_0.9px_3.6px_rgba(0,0,0,0.25)]
          px-5 pr-[70px]
        "
      >
        {/* Vänstra delen – fälten */}
        <div className="flex flex-1 items-stretch">
          {fields.map((field, index) => {
            const rawValue = values[field.id] ?? null;
            const displayValue = getDisplayValue(field, rawValue);
            const isOpen = openFieldId === field.id;
            const showDivider = !isSingleFieldMode && index > 0;

            // Hjälp för select-fält
            const selectedLabels: string[] =
              field.type === "select"
                ? Array.isArray(rawValue)
                  ? rawValue
                  : rawValue
                  ? [rawValue]
                  : []
                : [];

            // SINGLE FIELD MODE: search-input
            if (isSingleFieldMode && field.type === "search") {
              const hasOptions = (field.options?.length ?? 0) > 0;

              return (
                <div key={field.id} className="relative flex-1 flex items-center">
                  <div className="flex w-full flex-col justify-center">
                    <label className="text-[12.6px] font-normal text-black">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      className="
                        w-full border-none bg-transparent
                        text-[12.6px] text-black placeholder:text-black/50
                        focus:outline-none
                      "
                      placeholder={field.placeholder}
                      value={displayValue}
                      onChange={(e) => {
                        const text = e.target.value;
                        setValue(field.id, text);
                        setSearchTerm(text);
                        setIsFiltering(text.trim().length > 0);
                        if (hasOptions) {
                          setOpenFieldId(field.id);
                        }
                      }}
                      onFocus={() => {
                        if (hasOptions) {
                          setOpenFieldId(field.id);
                          setSearchTerm(displayValue);
                          setIsFiltering(false);
                        }
                      }}
                    />
                  </div>

                  {/* Dropdown under single-field input (egen dropdown) */}
                  {isOpen && hasOptions && filteredOptions.length > 0 && (
                    <div
                      className="
                        animate-dropdown
                        absolute left-0 top-full z-20 mt-2 w-full
                        rounded-3xl bg-white
                        shadow-[0_10px_25px_rgba(0,0,0,0.15)]
                        p-3
                      "
                    >
                      <div className="max-h-64 overflow-y-auto">
                        {filteredOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setValue(field.id, opt.label);
                              setOpenFieldId(null);
                              setSearchTerm("");
                              setIsFiltering(false);
                            }}
                            className="
                              flex w-full items-center justify-between
                              rounded-2xl px-3 py-2 text-left text-[12.6px]
                              hover:bg-[#F3F3F3]
                            "
                          >
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // MULTI FIELD MODE – övriga fält
            const fieldHasOptions =
              field.type === "select"
                ? field.options.length > 0
                : (field.options?.length ?? 0) > 0;

            return (
              <div
                key={field.id}
                className={`
                  relative flex flex-1 items-center justify-center
                  ${showDivider ? "border-l border-[rgba(30,30,30,0.15)] pl-5" : ""}
                `}
              >
                {/* Fall 1: searchable select – label + input i rutan (egen dropdown) */}
                {field.type === "select" && field.searchable ? (
                  <div className="flex w-full flex-col justify-center">
                    <span className="text-[12.6px] font-normal text-black">
                      {field.label}
                    </span>
                    <input
                      type="text"
                      className="
                        w-full border-none bg-transparent
                        text-[12.6px] text-black placeholder:text-black/50
                        focus:outline-none
                      "
                      placeholder={field.placeholder}
                      value={isOpen ? searchTerm : displayValue}
                      onChange={(e) => {
                        const text = e.target.value;
                        setSearchTerm(text);
                        setIsFiltering(text.trim().length > 0);
                        if (!isOpen && fieldHasOptions) {
                          setOpenFieldId(field.id);
                        }
                      }}
                      onFocus={() => {
                        if (fieldHasOptions) {
                          setOpenFieldId(field.id);
                          setSearchTerm("");
                          setIsFiltering(false);
                        }
                      }}
                    />
                  </div>
                ) : (
                  /* Fall 2: övriga fält – klickbar label + value/placeholder */
                  <button
                    type="button"
                    onClick={() => {
                      if (isOpen) {
                        setOpenFieldId(null);
                        setSearchTerm("");
                        setIsFiltering(false);
                      } else if (fieldHasOptions) {
                        setOpenFieldId(field.id);
                        setSearchTerm("");
                        setIsFiltering(false);
                      }
                    }}
                    className="
                      flex w-full flex-col justify-center text-left
                      focus:outline-none
                    "
                  >
                    <span className="text-[12.6px] font-normal text-black">
                      {field.label}
                    </span>
                    <span className="text-[12.6px] font-normal text-black/50">
                      {displayValue || field.placeholder}
                    </span>
                  </button>
                )}

                {/* Dropdown under rätt fält – egen dropdown för multi/select utan HeroUI */}
                {isOpen && fieldHasOptions && filteredOptions.length > 0 && (
                  <div
                    className="
                      animate-dropdown
                      absolute left-0 top-full z-20 mt-2 w-full
                      rounded-3xl bg-white
                      shadow-[0_10px_25px_rgba(0,0,0,0.15)]
                      p-3
                    "
                  >
                    <div className="max-h-64 overflow-y-auto">
                      {filteredOptions.map((opt) => {
                        const isSelected =
                          field.type === "select"
                            ? selectedLabels.includes(opt.label)
                            : false;

                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              if (field.type === "select") {
                                if (field.multiple) {
                                  // MULTI-SELECT: toggla label i array
                                  let next: string[];
                                  if (isSelected) {
                                    next = selectedLabels.filter((l) => l !== opt.label);
                                  } else {
                                    next = [...selectedLabels, opt.label];
                                  }

                                  setValue(field.id, next);

                                  if (field.searchable) {
                                    const newDisplay = getDisplayValue(field, next);
                                    setSearchTerm(newDisplay);
                                    setIsFiltering(false);
                                  }
                                } else {
                                  // SINGLE-SELECT
                                  setValue(field.id, opt.label);
                                  setOpenFieldId(null);
                                  setSearchTerm("");
                                  setIsFiltering(false);
                                }
                              } else {
                                setValue(field.id, opt.label);
                                setOpenFieldId(null);
                                setSearchTerm("");
                                setIsFiltering(false);
                              }
                            }}
                            className={`
                              flex w-full items-center justify-between
                              rounded-2xl px-3 py-1.5 text-left text-[12.6px]
                              hover:bg-[#F3F3F3]
                              ${isSelected ? "bg-[#E5F5EA]" : ""}
                            `}
                          >
                            <span>{opt.label}</span>
                            {isSelected && (
                              <span className="text-xs text-[#004323]">•</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sök-knapp */}
        <Button
          type="button"
          onClick={handleSubmit}
          className="
            absolute right-[6px] top-1/2 -translate-y-1/2
            flex h-[48px] w-[48px] items-center justify-center
            rounded-full bg-[#0F4D0F]
            shadow-[0_6px_14px_rgba(0,0,0,0.18)]
            focus:outline-none
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-[34px] w-[34px] text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="18" y1="18" x2="23.5" y2="23.5" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default SearchFilterBar;
