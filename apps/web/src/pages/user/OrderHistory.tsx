
import { Table } from "@/components/table/Table";


import { Input } from "@/components/ui/input";

import { PaginationComponent } from "@/components/PaginationComponent";
import FilterSortingSelection from "@/components/table/FilterSortingSelection";
import { flashMessage_Failed } from "@/lib/flash";
import { useState } from "react";



import Loading from "@/components/Loading";
import {
  orderFilterOptions,
  sortOrderOptions,
 
} from "@ecom/shared/src/type/order";
import { useOrderSearch } from "@/hooks/useOrderSearch";
import { customerOrderColumns } from "@/components/columns/CustomerOrderColumn";


export default function OrderHistory() {
  const { data, search, filters, pagination } = useOrderSearch({ limit: 20, mode:"customer" });

 const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});

 console.log("Order history goes wrong?");

  if (data.isError) {
    flashMessage_Failed(data.error ?? "Invalid action");
  }

  return (
    // filter selection
    <div className="container mx-auto py-10 h-full flex flex-col shrink-0 justify-center items-center">
      <div className="mb-2 flex justify-between flex-col md:flex-row w-5/6">
        <Input
          onChange={(e) => search.set(e.target.value)}
          type="text"
          placeholder="Search"
          className="flex-1 border-2 border-gray-300"
        />
        <FilterSortingSelection
          currentSort={filters.sort}
          sortOptions={sortOrderOptions}
          currentFilter={filters.filter}
          filterOptions={orderFilterOptions}
          updateFilter={filters.updateFilter}
          updateSort={filters.updateSort}
        ></FilterSortingSelection>
      </div>

      {data.isError && <div>Fetching product data failed</div>}
      {/* Table + Bulk modification options */}
      <div className="flex-1 w-5/6">
        {!data.isLoading && (
          <Table
            columns={customerOrderColumns}
            data={data.orders}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          
          />
        )}
        {data.isLoading && <Loading />}
      </div>
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <PaginationComponent
          activePage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(number) => pagination.goToPage(number)}
        ></PaginationComponent>
      )}
    </div>
  );
}
