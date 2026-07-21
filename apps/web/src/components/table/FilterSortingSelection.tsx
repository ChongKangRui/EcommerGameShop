import {
  //adminSortOptions,
  //type AdminSortByValue,
  productFilterOptions,
  type ProductFilterOptionsByValue,
} from "@ecom/shared/src/type/product";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption<T extends string = string> = {
  value: T;
  label: string;
};

type FilterSortingProps<T extends string = string> = {
  sortOptions: readonly SortOption<T>[];
  currentSort: T;
  currentFilter: string;
  filterOptions: string[];
  updateFilter: (value: string) => void;
  updateSort: (value: string) => void;
  className?: string;
};

export default function FilterSortingSelection<T extends string>({
  sortOptions,
  currentSort,
  currentFilter,
  filterOptions,
  updateFilter,
  updateSort,
  className,
}: FilterSortingProps<T>) {
  return (
    // Sort Options
    <div className={`flex justify-around md:justify-between ${className}`}>
      <Select value={currentSort} onValueChange={(e) => updateSort(e as T)}>
        <SelectTrigger className="w-full max-w-48">
          {sortOptions.find((option) => option.value === currentSort)?.label}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Sort</SelectLabel>
            {sortOptions.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

            {/* Filter options */}
      <Select
        value={currentFilter}
        onValueChange={(e) => updateFilter(e as T)}
      >
        <SelectTrigger className="w-full max-w-48">
          <SelectValue></SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Filter</SelectLabel>
            {filterOptions.map((value: string) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
