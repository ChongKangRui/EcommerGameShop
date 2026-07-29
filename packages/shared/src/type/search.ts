export interface SearchQueryParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
  filterBy?: string;
  search?: string;
  enabled?:boolean;
};

export function buildTableQueryParams({ limit, offset, sortBy, filterBy, search }: SearchQueryParams) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset ?? ""));
  if (sortBy) params.set("sortBy", sortBy);
  if (filterBy) params.set("filterBy", filterBy);
  if (search) params.set("search", search);
  return params;
}

// export interface TableRepositoryFilters extends SearchQueryParams {
//   limit: number;
//   offset: number;
//   sortColumn: string;
//   sortDirection: string;
//   filterParam: string;
//   search: string | null;
// }

export interface ProductListRepositoryFilter extends SearchQueryParams {
  includeInactive: boolean; 
  //filterParam: string;
}