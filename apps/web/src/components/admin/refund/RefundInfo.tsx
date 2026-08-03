import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";
import { useNavigate } from "react-router-dom";
import { useAdminOrderQuery } from "@/hooks/useOrder";
import Loading from "@/components/Loading";

import OrderReference from "@/components/order/OrderReference";
import RefundStatus from "./RefundStatus";

import CustomerInfo from "@/components/order/CustomerInfo";
import OrderItemList from "@/components/order/OrderItemList";
import { useAdminRefundQuery, useAdminRefundUpdate } from "@/hooks/useRefund";

export default function RefundInfo({ orderId }: { orderId: string }) {
  // require to show admin order/refund information
  const orderQuery = useAdminOrderQuery(orderId);
  const refundQuery = useAdminRefundQuery(orderId);
  const refundUpdateMutation = useAdminRefundUpdate();

  const orderData = orderQuery.data;
  const refundData = refundQuery.data;

  const [refundStatus, setRefundStatus] = useState("");
  const [refundAmount, setRefundAmount] = useState(0);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  //once refund query success, set the defaults refund status and refundAmount
  useEffect(() => {
    setRefundStatus(refundData?.status ?? "");
    setRefundAmount(Number(refundData?.amount) ?? 0);
  }, [refundQuery.isSuccess]);

  const onRefundAmountChange = (value: number) => {
    const clamped = Math.min(value, refundData?.amount ?? 0);
    setRefundAmount(clamped);
  };

  const onUpdateStatusConfirm = () => {
    refundUpdateMutation.mutate(
      {
        refundId: refundData?.refund_id ?? "",
        refundAmount: refundAmount,
        newStatus: refundStatus,
      },
      {
        onSuccess: () => {
          flashMessage_Success("Update refund status success");
           // Refund status changes affect dashboard metrics and order state too
          queryClient.invalidateQueries({
            queryKey: ["admin", "refund"],
          });
          queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["admin", "order"] });
        },
        onError: (err) => {
          flashMessage_Failed(err.message);
        },
      },
    );
  };

  if (orderQuery.isPending || refundQuery.isPending) {
    return <Loading />;
  }

  if (orderQuery.isError || refundQuery.isError || !orderData || !refundData) {
    flashMessage_Failed("Invalid refund page");
    navigate("/admin/refunds", { replace: true });
    return;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-5xl">
        <div className="block text-center mb-5">
          <h2 className="text-2xl">Order</h2>
        </div>

        <div className="flex flex-col md:flex-col md:gap-12 justify-center items-center">
          <OrderReference orderInfo={orderData.order} isAdmin={true} />
          <div className="w-5/6 ms-auto md:ms-0 md:w-7/12 lg:w-8/12">
            <CustomerInfo
              orderInfo={orderData.order}
              status={orderData?.order.status ?? ""}
            />
          </div>

          <RefundStatus
            refundInfo={refundData}
            status={refundStatus}
            onStatusChange={setRefundStatus}
            refundAmount={refundAmount}
            onRefundAmountChange={onRefundAmountChange}
          ></RefundStatus>

          <div className="">
            <OrderItemList items={orderData.orderItems} />
          </div>
        </div>

      {/* only pending are allow to update refund status */}
        {refundData.status === "pending" && (
          <div className="text-center mt-10 flex flex-col justify-center items-center md:flex-row md:gap-5">
            <Button
              type="button"
              className="cursor-pointer max-w-50"
              disabled={refundUpdateMutation.isPending}
              onClick={() => onUpdateStatusConfirm()}
            >
              Update Refund Status
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
