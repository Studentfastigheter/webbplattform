"use client";

import React from "react";
import SearchFilterBar, {
  FilterField,
  Option,
  FieldValue,
} from "./SearchFilterBar";

type OneFieldConfig = {
  id: string;
  label: string;
  placeholder: string;
  options?: Option[];
  searchable?: boolean;
};

export type OneFieldSearchProps = {
  field: OneFieldConfig;
  onSubmit: (values: Record<string, FieldValue>) => void;
  className?: string;
};

const OneFieldSearch: React.FC<OneFieldSearchProps> = ({
  field,
  onSubmit,
  className,
}) => {
  const fields: FilterField[] = [
    {
      type: "search",
      searchable: field.searchable ?? true,
      ...field,
    },
  ];

  return (
    <SearchFilterBar
      fields={fields}
      onSubmit={onSubmit}
      className={className}
    />
  );
};

export default OneFieldSearch;
