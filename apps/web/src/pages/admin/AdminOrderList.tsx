import { productColumn } from "@/components/admin/column/ProductColumn";

import { Table } from "@/components/admin/table/Table";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";

import { ProductPagination } from "@/components/ProductPagenition";
import FilterSortingSelection from "@/components/table/FilterSortingSelection";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";
import { useEffect, useState } from "react";

import { PopupDialogue } from "@/components/PopupDialogue";

import { Pencil } from "lucide-react";
import { useIsLgUp, useIsMdUp } from "@/lib/utils";
import Loading from "@/components/Loading";
import {
  adminOrderSortOptions,
  adminOrderTypeOptions,
  orderAdminFilterOptions,
  orderAdminStatusUpdateOptions,
  type AdminOrderTypeEnum,
} from "@ecom/shared/src/type/order";
import { useOrderSearch } from "@/hooks/useOrderSearch";
import { orderColumns } from "@/components/admin/column/OrderColumn";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminOrdersUpdate } from "@/hooks/useOrder";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminOrderList() {
  const { data, search, filters, pagination } = useOrderSearch({ limit: 20 });

  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});

  // Bulk modification input state
  const [orderStatus, setOrderStatus] = useState("pending");

  // Bulk modification dialogue and button state
  const [statusDialogueOpen, setStatusDialogueOpen] = useState(false);
  const [dialogueButtonDisable, setDialogueButtonDisable] = useState(false);

  // Size condition
  const isMdUp = useIsMdUp();
  const isLgUp = useIsLgUp();

  const queryClient = useQueryClient();

  const bulkUpdateOrders = useAdminOrdersUpdate();

  const getSelectedOrderID = () => {
    const selectedRow = data.orders.filter((d, i) => rowSelection[i]);

    const orderIds = selectedRow.map((d) => d.order_id);
    return orderIds;
  };

  useEffect(() => {
    if (statusDialogueOpen) {
      setDialogueButtonDisable(false);
    }
  }, [statusDialogueOpen]);

  // Bulk delete execute function
  const onStatusUpdateConfirm = () => {
    // const id = selectedData.map((d)=>d.?product_id)
    const orderIds = getSelectedOrderID();

    bulkUpdateOrders.mutate(
      { newStatus: orderStatus, orderIds },
      {
        onSuccess: (data) => {
          flashMessage_Success(data.message);
          queryClient.invalidateQueries({
            queryKey: ["admin", "orders"],
            refetchType: "active",
          });
          setRowSelection({});
          setStatusDialogueOpen(false);
          setOrderStatus("pending");
          setDialogueButtonDisable(false);
        },
        onError: (err) => {
          flashMessage_Failed(err.message);
           setStatusDialogueOpen(false);
          setOrderStatus("pending");
          setDialogueButtonDisable(false);
        },
      },
    );

    setDialogueButtonDisable(true);
  };

  if (data.isError) {
    flashMessage_Failed(data.error ?? "Invalid action");
  }

  return (
    // filter selection
    <div className="container mx-auto py-10 h-full flex flex-col shrink-0">
      <div className="mb-2 flex justify-between flex-col md:flex-row">
        <Input
          onChange={(e) => search.set(e.target.value)}
          type="text"
          placeholder="Search"
          className="flex-1 border-2 border-gray-300"
        />
        <FilterSortingSelection
          currentSort={filters.sort}
          sortOptions={adminOrderSortOptions}
          currentFilter={filters.filter}
          filterOptions={orderAdminFilterOptions}
          updateFilter={filters.updateFilter}
          updateSort={filters.updateSort}
        ></FilterSortingSelection>
      </div>

      {data.isError && <div>Fetching product data failed</div>}
      {/* Table + Bulk modification options */}
      <div className="flex-1">
        {!data.isLoading && (
          <Table
            columns={orderColumns}
            data={data.orders}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            columnVisibility={{
              email: isLgUp,
              total_amount: isMdUp,
            }}
            bulkAction={
              <div className="flex">
                {/* bulk status update*/}
                <PopupDialogue
                  title="Warning: You are bulk modify order status.(Status may not guarantee to update if status conflict happen) "
                  trigger={<Pencil className="text-black" />}
                  content={
                    <div className="col-span-3 flex justify-center items-start">
                      <p>Order Status: </p>
                      <Select
                        // defaultValue={orderStatus}
                        onValueChange={(e) => {
                          if (e) {
                            setOrderStatus(e as AdminOrderTypeEnum);
                          }
                        }}
                      >
                        <SelectTrigger id="orderStatus">
                          <SelectValue>{orderStatus}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {orderAdminStatusUpdateOptions.map((s, i) => {
                            return (
                              <SelectItem key={s + i} value={s}>
                                {s}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  }
                  triggerClassName="cursor-pointer bg-white hover:bg-white"
                  onConfirm={() => onStatusUpdateConfirm()}
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
        <ProductPagination
          activePage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(number) => pagination.goToPage(number)}
        ></ProductPagination>
      )}
    </div>
  );
}
