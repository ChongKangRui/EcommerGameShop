import { productColumn } from "@/components/admin/column/ProductColumn";

import { Table } from "@/components/admin/table/Table";
import { Eye, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";

import { adminProductSortOptions, productFilterOptions } from "@ecom/shared/src/type/product";
import { ProductPagination } from "@/components/ProductPagenition";
import FilterSortingSelection from "@/components/table/FilterSortingSelection";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";
import { useProductSearch } from "@/hooks/useProductSearch";
import { useEffect, useState } from "react";
import {
  useBulkProductActiveMutation,
  useBulkProductDiscountMutation as useBulkProductDiscountMutation,
  useBulkProductPromoteMutation,
  useDeleteProductsMutation,
} from "@/hooks/useProduct";

import { Flame, Percent, Trash } from "lucide-react";
import { PopupDialogue } from "@/components/PopupDialogue";
import FormField from "@/components/FormField";

import { useQueryClient } from "@tanstack/react-query";
import { useIsLgUp, useIsMdUp } from "@/lib/utils";
import Loading from "@/components/Loading";
import { useBulkAction } from "@/hooks/useBulkAction";

export default function AdminProductList() {
  const { data, search, filters, pagination } = useProductSearch({ limit: 20, showNonActive: true });

  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});

  const getSelectedProductID = () => {
    const selectedRow = data.products.filter((d, i) => rowSelection[i]);
    const productIds = selectedRow.map((d) => d.product_id);
    return productIds;
  };

   // Mutation
  const deleteMutation = useDeleteProductsMutation();
  const discountMutation = useBulkProductDiscountMutation();
  const promoteMutation = useBulkProductPromoteMutation();
  const activeMutation = useBulkProductActiveMutation();

   const [dialogueButtonDisable, setDialogueButtonDisable] = useState(false);

  const deleteAction = useBulkAction({
  mutation: deleteMutation,
  getSelectedProductID,
  buildVariables: (ids) => ids,
  initialValue: undefined as void,
   setDialogueButtonDisable: setDialogueButtonDisable
});

const discountAction = useBulkAction({
  mutation: discountMutation,
  getSelectedProductID,
  buildVariables: (ids, value: number) => ({ productIds: ids, discountPercentage: value }),
  initialValue: 0,
  validate: (value) => {
    if (value < 0) return "Discount cannot be negative";
    if (value > 100) return "Discount cannot exceed 100%";
    return null;
  },
  setDialogueButtonDisable: setDialogueButtonDisable
});

const promoteAction = useBulkAction({
  mutation: promoteMutation,
  getSelectedProductID,
  buildVariables: (ids, value: boolean) => ({ productIds: ids, promote: value }),
  initialValue: false,
   setDialogueButtonDisable: setDialogueButtonDisable
});

const activeAction = useBulkAction({
  mutation: activeMutation,
  getSelectedProductID,
  buildVariables: (ids, value: boolean) => ({ productIds: ids, active: value }),
  initialValue: false,
  setDialogueButtonDisable: setDialogueButtonDisable
});

  // Bulk modification input state
  // const [discountPercentage, setDiscountPercentage] = useState(0);
  // const [discountValueError, setDiscountValueError] = useState("");
  // const [promote, setPromote] = useState(false);
  // const [productActive, setProductActive] = useState(false);

  // Bulk modification dialogue and button state
  // const [deleteDialogueOpen, setDeleteDialogueOpen] = useState(false);
  // const [promoteDialogueOpen, setPromoteDialogueOpen] = useState(false);
  // const [discountDialogueOpen, setDiscountDialogueOpen] = useState(false);
  // const [activeDialogueOpen, setActiveDialogueOpen] = useState(false);

 

 

  // Size condition
  const isMdUp = useIsMdUp();
 //const isLgUp = useIsLgUp();

  const queryClient = useQueryClient();

  // const onDiscountChange = (value: number) => {
  //   if (value < 0) {
  //     discountAction.setError("Discount cannot be negative");
  //   } else if (value > 100) {
  //     discountAction.setError(" Discount cannot exceed 100%");
  //   } else {
  //     discountAction.setError("");
  //     discountAction.setValue(value);
  //   }
  // };

  

  useEffect(()=>{
    if(deleteAction.dialogueOpen || promoteAction.dialogueOpen|| discountAction.dialogueOpen || activeAction.dialogueOpen){
      setDialogueButtonDisable(false);
     
    }
  }, [deleteAction.dialogueOpen, promoteAction.dialogueOpen, discountAction.dialogueOpen, activeAction.dialogueOpen])


  // Bulk delete execute function
  // const onDeleteConfirm = () => {
  //   // const id = selectedData.map((d)=>d.?product_id)
  //   const productIds = getSelectedProductID();
  //   deleteMutation.mutate(productIds, {
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({
  //         queryKey: ["products"],
  //         refetchType: "active",
  //       });
  //       setDeleteDialogueOpen(false);
       
  //       flashMessage_Success("Remove products success");
  //       console.log("Did i success");
  //     },
  //     onError: (e) => {
  //       console.log("Bulk delete product error", e);
  //       flashMessage_Failed("Invalid action");
  //       setDeleteDialogueOpen(false);
       
  //     },
  //   });

  //   setDialogueButtonDisable(true);
  // };

  // const onDiscountConfirm = (value: number) => {
  //   if (value < 0 || value > 100) {
  //     flashMessage_Failed("Invalid action, discount number invalid");
  //     return;
  //   }
  //   const productIds = getSelectedProductID();
  //   setDialogueButtonDisable(true);
  //   discountMutation.mutate(
  //     { productIds, discountPercentage: value },
  //     {
  //       onSuccess: (res) => {
  //         queryClient.invalidateQueries({
  //         queryKey: ["products"],
  //         refetchType: "active",
  //       })
  //         setDiscountDialogueOpen(false);
  //         flashMessage_Success(res.message);
  //       },
  //       onError: (err) => {
  //         setDiscountDialogueOpen(false);
  //         flashMessage_Failed(err.message);
  //       },
  //     },
  //   );
   
  // };

  // const onPromoteConfirm = () => {
   
  //   const productIds = getSelectedProductID();
  //   setDialogueButtonDisable(true);
  //   promoteMutation.mutate(
  //     { productIds, promote: promoteAction. },
  //     {
  //       onSuccess: (res) => {
  //       queryClient.invalidateQueries({
  //         queryKey: ["products"],
  //         refetchType: "active",
  //       })
  //         setPromoteDialogueOpen(false);
  //         setPromote(false);
  //         flashMessage_Success(res.message);
  //       },
  //       onError: (err) => {
  //         setPromoteDialogueOpen(false);
  //         setPromote(false);
  //         flashMessage_Failed(err.message);
  //       },
  //     },
  //   );
   
  // };

  // const onProductActiveConfirm = ()=>{
  //   const productIds = getSelectedProductID();
  //   setDialogueButtonDisable(true);
  //   activeMutation.mutate(
  //     { productIds, active: productActive },
  //     {
  //       onSuccess: (res) => {
  //       queryClient.invalidateQueries({
  //         queryKey: ["products"],
  //         refetchType: "active",
  //       })
  //         setActiveDialogueOpen(false);
  //         setProductActive(false);
  //         flashMessage_Success(res.message);
  //       },
  //       onError: (err) => {
  //         setActiveDialogueOpen(false);
  //         setProductActive(false);
  //         flashMessage_Failed(err.message);
  //       },
  //     },
  //   );
  // }

  if(data.isError){
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
          sortOptions={adminProductSortOptions}
          currentFilter={filters.filter}
          filterOptions={productFilterOptions}
          updateFilter={filters.updateFilter}
          updateSort={filters.updateSort}
        ></FilterSortingSelection>
      </div>

{data.isError && <div>Fetching product data failed</div>
  }
{/* Table + Bulk modification options */}
      <div className="flex-1">

        {!data.isLoading && !data.error && (
          <Table
            columns={productColumn}
            data={data.products}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            columnVisibility={{
              price: isMdUp,
              is_active: isMdUp
              //discount_percentage: isMdUp,
              //push_home_page: isLgUp
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
                  onConfirm={() => deleteAction.confirm()}
                  open={deleteAction.dialogueOpen}
                  onOpenChange={deleteAction.setDialogueOpen}
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
                      onChange={(e) => promoteAction.setValue(e.target.checked)}
                    ></FormField>
                  }
                  triggerClassName="cursor-pointer bg-white hover:bg-white"
                  onConfirm={() => promoteAction.confirm()}
                  open={promoteAction.dialogueOpen}
                  onOpenChange={promoteAction.setDialogueOpen}
                  onCancel={() => promoteAction.setValue(false)}
                  
                  disableButton={dialogueButtonDisable}
                ></PopupDialogue>

                  {/* bulk set product active */}
                <PopupDialogue
                  title="Attention"
                  trigger={<Eye className="text-black cursor-pointer" />}
                  content={
                    <FormField
                      className="flex flex-row justify-between items-center"
                      inputClassname="h-6"
                      id="active"
                      label="Set product active state"
                      type="checkbox"
                      placeholder=""
                      required={false}
                      onChange={(e) => activeAction.setValue(e.target.checked)}
                    ></FormField>
                  }
                  triggerClassName="cursor-pointer bg-white hover:bg-white"
                  onConfirm={() => activeAction.confirm()}
                  open={activeAction.dialogueOpen}
                  onOpenChange={activeAction.setDialogueOpen}
                  onCancel={() => activeAction.setValue(false)}
                  
                  disableButton={dialogueButtonDisable}
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
                        label="Discount apply to selected product"
                        type="number"
                        step={0.1}
                        placeholder=""
                        required={false}
                        onChange={(e) =>
                          discountAction.setValue(Number(e.target.value))
                        }
                      ></FormField>

                      <div className="text-red-500">{discountAction.error}</div>
                    </div>
                  }
                  triggerClassName="cursor-pointer bg-white hover:bg-white"
                  onCancel={() => discountAction.setError("")}
                  onConfirm={() => discountAction.confirm()}
                  open={discountAction.dialogueOpen}
                  onOpenChange={discountAction.setDialogueOpen}
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
