"use client";

import React from "react";
import SearchFilterBar, {
  FilterField,
  Option,
  FieldValue,
} from "./SearchFilterBar";

type ThreeFieldConfig = {
  id: string;
  label: string;
  placeholder: string;
  options: Option[];
  searchable?: boolean;
  multiple?: boolean;
};

export type ThreeFieldSearchProps = {
  field1: ThreeFieldConfig;
  field2: ThreeFieldConfig;
  field3: ThreeFieldConfig;
  onSubmit: (values: Record<string, FieldValue>) => void;
  className?: string;
};

const ThreeFieldSearch: React.FC<ThreeFieldSearchProps> = ({
  field1,
  field2,
  field3,
  onSubmit,
  className,
}) => {
  const fields: FilterField[] = [
    { type: "select", ...field1 },
    { type: "select", ...field2 },
    { type: "select", ...field3 },
  ];

  return (
    <SearchFilterBar
      fields={fields}
      onSubmit={onSubmit}
      className={className}
    />
  );
};

export default ThreeFieldSearch;
