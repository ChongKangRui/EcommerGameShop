import {
  productColumn,
  type Product,
} from "@/components/admin/product/column/ProductColumn";

import { ProductTable } from "@/components/admin/product/table/ProductTable";
import { Loader2 } from "lucide-react";
import { useGetProducts } from "@/hooks/useProduct";
import { Input } from "@base-ui/react";
import { useEffect, useState } from "react";
import {
  adminSortOptions,
  type AdminSortByValue,
  productFilterOptions,
  type ProductFilterOptionsByValue
} from "@ecom/shared/src/type/product";
import { ProductPagination } from "@/components/ProductPagenition";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams } from "react-router"; 
import FilterSorting from "@/components/shop/FilterAndSorting";
import { flashMessage_Failed } from "@/lib/flash";
import { useProductSearch } from "@/hooks/useProductSearch";

export default function AdminProductList() {

const { data, search, filters, pagination } = useProductSearch({limit:20});
  //const data = getData();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const pageIndex = Number(searchParams.get("page") ?? 0);
//   const sort = searchParams.get("sort") ?? "release_date:desc";
//   const filter = searchParams.get("filter") ?? "all";
//   const urlSearch = searchParams.get("search") ?? "";

//   const [searchInput, setSearchInput] = useState(urlSearch);
//   const debouncedSearch = useDebounce(searchInput, 700);

//  const limit = 20;
//     useEffect(() => {
//     if (debouncedSearch === urlSearch) return;
//     setSearchParams(prev => {
//       const next = new URLSearchParams(prev);
//       debouncedSearch ? next.set("search", debouncedSearch) : next.delete("search");
//       next.delete("page"); // new search = back to page 1
//       return next;
//     });
//   }, [debouncedSearch]);

//     function updateFilter(key: string, value: string) {
//     setSearchParams(prev => {
//       const next = new URLSearchParams(prev);
//       value ? next.set(key, value) : next.delete(key);
//       next.delete("page"); // any filter/sort change resets pagination
//       return next;
//     });
//   }

//   function goToPage(newPageIndex: number) {
//     setSearchParams(prev => {
//       const next = new URLSearchParams(prev);
//       next.set("page", String(newPageIndex));
//       return next;
//     });
//   }

//    const { data, isLoading, isError, error } = useGetProducts({
//     limit,
//     offset: pageIndex * limit,
//     sortBy: sort,
//     filterBy: filter,
//     search: debouncedSearch,
//   });

   if(data.isError){
     flashMessage_Failed(data.error ?? "Invalid action");
     return(<div>Fetching product data failed</div>);
   }

//   const totalPage = isLoading && !isError ? 0 : Math.ceil(data.productCount / limit);

  return (
    <div className="container mx-auto py-10 h-full flex flex-col shrink-0">
      <div className="mb-2 flex justify-between flex-col md:flex-row">
        <Input
          onValueChange={search.set}
          type="text"
          placeholder="Search"
          className="flex-1 border-2 border-gray-300"
        />
        <FilterSorting currentSort={filters.sort} sortOptions={adminSortOptions} 
        currentFilter={filters.filter} updateFilter={filters.updateFilter} updateSort={filters.updateSort} ></FilterSorting>
       
      </div>

      <div className="flex-1">
        {!data.isLoading && (
          <ProductTable columns={productColumn} data={data.products} />
        )}
        {data.isLoading && (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <ProductPagination
          activePage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(number) =>
           pagination.goToPage(number)
          }
        ></ProductPagination>
      )}
    </div>
  );
}
