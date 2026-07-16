import { productColumn } from "@/components/admin/product/column/ProductColumn";

import { Table } from "@/components/admin/product/table/Table";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";

import { adminSortOptions } from "@ecom/shared/src/type/product";
import { ProductPagination } from "@/components/ProductPagenition";
import FilterSortingSelection from "@/components/shop/FilterSortingSelection";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";
import { useProductSearch } from "@/hooks/useProductSearch";
import { useState } from "react";
import {
  useBulkProductDiscountMutation as useBulkProductDiscountMutation,
  useBulkProductPromoteMutation,
  useDeleteProductsMutation,
} from "@/hooks/useProduct";

import { Flame, Percent, Trash } from "lucide-react";
import { PopupDialogue } from "@/components/PopupDialogue";
import FormField from "@/components/FormField";

import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/lib/utils";
import Loading from "@/components/Loading";

export default function AdminProductList() {
  const { data, search, filters, pagination } = useProductSearch({ limit: 20 });

  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountValueError, setDiscountValueError] = useState("");
  const [discountCloseOnConfirmClick, setDiscountCloseOnConfirmClick] =
    useState(true);
  const [promote, setPromote] = useState(true);

  const [deleteDialogueOpen, setDeleteDialogueOpen] = useState(false);
  const [promoteDialogueOpen, setPromoteDialogueOpen] = useState(false);
  const [discountDialogueOpen, setDiscountDialogueOpen] = useState(false);

  const [dialogueButtonDisable, setDialogueButtonDisable] = useState(false);

  const deleteMutation = useDeleteProductsMutation();
  const discountMutation = useBulkProductDiscountMutation();
  const promoteMutation = useBulkProductPromoteMutation();

  const isMobile = useIsMobile();

  const queryClient = useQueryClient();

  const onDiscountChange = (value: number) => {
    if (value < 0) {
      setDiscountValueError("Discount cannot be negative");
      setDiscountCloseOnConfirmClick(false);
    } else if (value > 100) {
      setDiscountValueError(" Discount cannot exceed 100%");
      setDiscountCloseOnConfirmClick(false);
    } else {
      setDiscountValueError("");
      setDiscountPercentage(value);
      setDiscountCloseOnConfirmClick(true);
    }
  };

  const getSelectedProductID = () => {
    const selectedRow = data.products.filter((d, i) => rowSelection[i]);
    const productIds = selectedRow.map((d) => d.product_id);
    return productIds;
  };

  // Finish off backend and frontend for bulk delete, promote or discount
  // create multiple test product for delete

  // Bulk delete execute function
  const onDeleteConfirm = () => {
    // const id = selectedData.map((d)=>d.?product_id)
    const productIds = getSelectedProductID();
    deleteMutation.mutate(productIds, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["products"],
          refetchType: "active",
        });
        setDeleteDialogueOpen(false);
        setDialogueButtonDisable(false);
        flashMessage_Success("Remove products success");
        console.log("Did i success");
      },
      onError: (e) => {
        console.log("Bulk delete product error", e);
        flashMessage_Failed("Invalid action");
         setDeleteDialogueOpen(false);
        setDialogueButtonDisable(false);
      },
    });

    setDialogueButtonDisable(true);
  };

  const onDiscountConfirm = (value: number) => {
    if (value < 0 || value > 100) {
      flashMessage_Failed("Invalid action, discount number invalid");
      return;
    }
    console.log();
  };

  const onPromoteConfirm = () => {};

  // const isLoading = deleteMutation.isPending || promoteMutation.isPending
  // || discountMutation.isPending || data.isLoading;

  if (data.isError) {
    flashMessage_Failed(data.error ?? "Invalid action");
    return <div>Fetching product data failed</div>;
  }

  return (
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
          sortOptions={adminSortOptions}
          currentFilter={filters.filter}
          updateFilter={filters.updateFilter}
          updateSort={filters.updateSort}
        ></FilterSortingSelection>
      </div>

      <div className="flex-1">
        {!data.isLoading && (
          <Table
            columns={productColumn}
            data={data.products}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            columnVisibility={{
              price: !isMobile,
              discount_percentage: !isMobile,
            }}
            bulkAction={
              <div className="flex">
                {/* bulk delete, delete multiple product */}
                <PopupDialogue
                  title="Warning"
                  trigger={
                    <Trash className="text-red-600 cursor-pointer"></Trash>
                  }
                  content="You are performing a permanent delete of multiple product, are you sure you wanna continue?"
                  triggerClassName="cursor-pointer bg-white hover:bg-white"
                  onConfirm={() => onDeleteConfirm()}
                  open={deleteDialogueOpen}
                  onOpenChange={setDeleteDialogueOpen}
                  disableButton={dialogueButtonDisable}
                ></PopupDialogue>

                {/* bulk promote, promote selected products to home page */}
                <PopupDialogue
                  title="Attention"
                  trigger={<Flame className="text-yellow-400 cursor-pointer" />}
                  content={
                    <FormField
                      className="flex flex-row justify-between items-center"
                      inputClassname="h-6"
                      id="push-to-home"
                      label="Promote these products to home page?"
                      type="checkbox"
                      placeholder=""
                      required={false}
                      onChange={(e) => setPromote(e.target.checked)}
                    ></FormField>
                  }
                  triggerClassName="cursor-pointer bg-white hover:bg-white"
                  onConfirm={() => {}}
                  open={promoteDialogueOpen}
                  onOpenChange={setPromoteDialogueOpen}
                ></PopupDialogue>

                {/* bulk discount */}
                <PopupDialogue
                  title="Warning"
                  trigger={
                    <Percent className="text-green-600 cursor-pointer" />
                  }
                  content={
                    <div>
                      <FormField
                        className=""
                        inputClassname="h-6"
                        id="discount"
                        label="Discount apply to all product"
                        type="number"
                        step={0.1}
                        placeholder=""
                        required={false}
                        onChange={(e) =>
                          onDiscountChange(Number(e.target.value))
                        }
                      ></FormField>

                      <div className="text-red-500">{discountValueError}</div>
                    </div>
                  }
                  triggerClassName="cursor-pointer bg-white hover:bg-white"
                  onCancel={() => setDiscountValueError("")}
                  onConfirm={() => onDiscountConfirm(discountPercentage)}
                  open={discountDialogueOpen}
                  onOpenChange={setDiscountDialogueOpen}
                ></PopupDialogue>
              </div>
            }
          />
        )}
        {data.isLoading && <Loading />}
      </div>

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
