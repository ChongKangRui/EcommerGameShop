
import { Table } from "@/components/table/Table";
import { Ban } from "lucide-react";

import { Input } from "@/components/ui/input";

import { PaginationComponent } from "@/components/PaginationComponent";
import FilterSortingSelection from "@/components/table/FilterSortingSelection";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";
import { useEffect, useState } from "react";

import { PopupDialogue } from "@/components/PopupDialogue";

import { useIsLgUp, useIsMdUp } from "@/lib/utils";
import Loading from "@/components/Loading";


import { useQueryClient } from "@tanstack/react-query";
import { useRefundSearch } from "@/hooks/useRefundSearch";
import { refundColumn } from "@/components/columns/RefundColumn";
import {
  refundFilterOptions,

  sortRefundTableOptions,

} from "@ecom/shared/src/type/refund";
import { useAdminBulkRejectRefund } from "@/hooks/useRefund";

export default function AdminRefundList() {
  const { data, search, filters, pagination } = useRefundSearch({ limit: 20 });

  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});

  // Bulk modification dialogue and button state
  const [statusDialogueOpen, setStatusDialogueOpen] = useState(false);
  const [dialogueButtonDisable, setDialogueButtonDisable] = useState(false);

  // Size condition
  const isMdUp = useIsMdUp();
  const isLgUp = useIsLgUp();

  const queryClient = useQueryClient();

  //const bulkUpdateOrders = useAdminOrdersUpdate();

  const bulkRejectRefundMutation = useAdminBulkRejectRefund();

  const getSelectedRowId = () => {
    const selectedRow = data.refunds.filter((_d, i) => rowSelection[i]);

    const refundIds = selectedRow.map((d) => d.refund_id);
    return refundIds;
  };

  useEffect(() => {
    if (statusDialogueOpen) {
      setDialogueButtonDisable(false);
    }
  }, [statusDialogueOpen]);

  // Bulk reject execute function
  const onMassRejectConfirm = () => {
    // const id = selectedData.map((d)=>d.?product_id)
    const refundIds = getSelectedRowId();
    console.log(refundIds);
     setDialogueButtonDisable(true);
      
    bulkRejectRefundMutation.mutate(refundIds, {
      onSuccess: (data) => {
        console.log(data.amount);
        queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] });
         
         setStatusDialogueOpen(false);
         flashMessage_Success(`Successfully reject ${data.amount} refund request`);
      },
      onError: (err) => {
         
         setStatusDialogueOpen(false);
        flashMessage_Failed(err.message);
      },
    });


    setDialogueButtonDisable(true);
  };

  if (data.isError) {
    flashMessage_Failed(data.error ?? "Invalid action");
  }

  return (
    // filter selection
    <div className="container mx-auto py-10 h-full flex flex-col shrink-0 min-h-0">
      <div className="mb-2 flex justify-between flex-col md:flex-row min-h-0">
        <Input
          onChange={(e) => search.set(e.target.value)}
          type="text"
          placeholder="Search"
          className="flex-1 border-2 border-gray-300"
        />
        <FilterSortingSelection
          currentSort={filters.sort}
          sortOptions={sortRefundTableOptions}
          currentFilter={filters.filter}
          filterOptions={refundFilterOptions}
          updateFilter={filters.updateFilter}
          updateSort={filters.updateSort}
        ></FilterSortingSelection>
      </div>

      {data.isError && <div>Fetching refund data failed</div>}
      {/* Table + Bulk modification options */}
      <div className="flex-1">
        {!data.isLoading && (
          <Table
            columns={refundColumn}
            data={data.refunds}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            columnVisibility={{
              processed_by: isLgUp,
              requested_by: isMdUp,
              total_amount: isMdUp,
            }}
            bulkAction={
              <div className="flex">
                {/* bulk status update*/}
                <PopupDialogue
                  title="Warning"
                  trigger={<Ban className="text-red-600 cursor-pointer"></Ban>}
                  content="You are performing a mass rejection for multiple refund request, are you sure you wanna continue?"
                  triggerClassName="cursor-pointer bg-white hover:bg-white"
                  onConfirm={() => onMassRejectConfirm()}
                  open={statusDialogueOpen}
                  onOpenChange={setStatusDialogueOpen}
                  disableButton={dialogueButtonDisable}
                ></PopupDialogue>
              </div>
            }
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
