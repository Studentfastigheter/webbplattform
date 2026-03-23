//
// Author: JaarmaCo@git
//
// The following is a workaround for SearchFilterBar that works for any number of
// single-select search options.
//
// The regular SearchFilterBar implementation does not properly handle the "value"
// property of every select box. In the current version of SearchFilterBar, the label
// is used in stead of the value in single-select mode.
//
// This is not optimal, as we cannot rely on the presentation value, and selection value
// to be the same. PRESENTATION WILL CHANGE IF WE EVER DECIDE TO ADD MULTILINGUAL SUPPORT.
//
// TODO: Properly implement this functionality in SearchFilterBar and remove this file.
//

import SearchFilterBar, {
  FilterField,
  Option
} from "@/components/Listings/Search/SearchFilterBar";

export type SingleOptionSearchField2 = {
  id: string;
  label: string;
  placeholder: string;
  options: Record<string, string>;
};

export type SearchFilterBarProps2 = {
  fields: SingleOptionSearchField2[];
  onSubmit?: (values: Record<string, string>) => void;
  className?: string;
};

const SearchFilterBar2: React.FC<SearchFilterBarProps2> = ({
  fields,
  onSubmit,
  className = "",
}) => {
  const fieldsById: Record<string, SingleOptionSearchField2> = {};
  for (const field of fields) {
    fieldsById[field.id] = field;
  }

  const translatedFields: FilterField[] = fields.map(({ id, label, placeholder, options }) => {
    return ({
      type: "select",
      id: id,
      label: label,
      options: Object.entries(options)
                     .map(([key, value]) => ({ label: key, value: value }) as Option),
      placeholder: placeholder,
      searchable: true,
      multiple: false,
    }) as SelectField;
  });

  return (
  <SearchFilterBar
      fields={translatedFields}
      onSubmit={selected => {
        if (onSubmit === null) {
          return;
        }
        const mapped: Record<string, string> = {};
        for (const [key, value] of Object.entries(selected)) {
          mapped[key] = fieldsById[key].options[value];
        }
        onSubmit(mapped);
      }}
      className={className}/>)
}

export default SearchFilterBar2;

