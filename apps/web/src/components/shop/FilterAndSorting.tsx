
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
} from "@/components/ui/select"


type SortOption<T extends string = string> = {
  value: T;
  label: string;
};

type FilterSortingProps<T extends string = string> = {
  sortOptions: readonly SortOption<T>[];
  currentSort: T;
  currentFilter: string;
  updateFilter: (value: string) => void;
  updateSort:(value: string) => void;
};

export default function FilterSorting<T extends string>({
  sortOptions,
  currentSort,
  currentFilter,
  updateFilter,
  updateSort
}: FilterSortingProps<T>) {
    
  return (
    <div className="flex justify-around md:justify-between">
        <Select  value={currentSort}
        onValueChange={(e) =>
          updateSort(e as T)
        }>
      <SelectTrigger className="w-full max-w-48">
        {sortOptions.find(option => option.value === currentSort)?.label}
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
      {/* <select
        value={currentSort}
        onChange={(e) =>
          updateFilter("sort", e.target.value as T)
        }
      >
        {sortOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select> */}
{/* 
      <select
        value={currentFilter}
        onChange={(e) =>
          updateFilter("filter", e.target.value as ProductFilterOptionsByValue)
        }
      >
        {productFilterOptions.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select> */}


<Select  value={currentFilter}
        onValueChange={(e) =>
          updateFilter(e as ProductFilterOptionsByValue)
        }>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue></SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Filter</SelectLabel>
          {productFilterOptions.map((value) => (
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