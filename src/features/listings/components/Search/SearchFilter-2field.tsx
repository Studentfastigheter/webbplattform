"use client";

import React from "react";
import SearchFilterBar, {
  FilterField,
  Option,
  FieldValue,
} from "./SearchFilterBar";

type TwoFieldConfig = {
  id: string;
  label: string;
  placeholder: string;
  options: Option[];
  searchable?: boolean;
  multiple?: boolean;
};

export type TwoFieldSearchProps = {
  field1: TwoFieldConfig;
  field2: TwoFieldConfig;
  onSubmit: (values: Record<string, FieldValue>) => void;
  className?: string;
};

const TwoFieldSearch: React.FC<TwoFieldSearchProps> = ({
  field1,
  field2,
  onSubmit,
  className,
}) => {
  const fields: FilterField[] = [
    { type: "select", ...field1 },
    { type: "select", ...field2 },
  ];

  return (
    <SearchFilterBar
      fields={fields}
      onSubmit={onSubmit}
      className={className}
    />
  );
};

export default TwoFieldSearch;
