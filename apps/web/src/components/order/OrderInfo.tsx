import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";

import { PopupDialogue } from "@/components/PopupDialogue";

import { useQueryClient } from "@tanstack/react-query";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";
import { useNavigate } from "react-router-dom";
import {
  useAdminOrderQuery,
  useAdminOrderUpdate,
  useCustomerOrderQuery,
} from "@/hooks/useOrder";
import Loading from "@/components/Loading";
import CustomerInfo from "./CustomerInfo";
import OrderItemList from "./OrderItemList";
import OrderReference from "@/components/order/OrderReference";
import { useRefundRequest } from "@/hooks/useRefund";

import { Textarea } from "../ui/textarea";

export default function OrderInfo({
  orderId,
  isAdmin,
}: {
  orderId: string;
  isAdmin: boolean;
}) {
  const orderQuery = isAdmin
    ? useAdminOrderQuery(orderId)
    : useCustomerOrderQuery(orderId);
  const orderUpdate = useAdminOrderUpdate(orderId);
  const refundRequest = useRefundRequest(orderId);

  const data = orderQuery.data;

  const [status, setStatus] = useState("");
  const [refundDialogue, setRefundDialogue] = useState<{
    open: boolean;
    disable: boolean;
  }>({ open: false, disable: false });
  const [refundMessage, setRefundMessage] = useState("");
  const [refundError, setRefundError] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onRefundMessageChanged = (change: string) => {
    setRefundMessage(change);

    if (change.length <= 0) {
      setRefundError("Refund reason is required");
      //setRefundDialogue((prev) => ({ ...prev, disable: false }));
    } else if (change.length > 1000) {
      setRefundError("Refund reason must be under 1000 characters");
      //setRefundDialogue((prev) => ({ ...prev, disable: true }));
    } else {
      setRefundError("");
    }
  };

  const onRefundConfirm = () => {
    if (refundMessage.trim().length <= 0) {
      setRefundError("Refund reason is required");

      return;
    } else if (refundMessage.trim().length >= 1000) {
      setRefundError("Refund reason must be under 1000 characters");

      return;
    }
    setRefundDialogue({ open: false, disable: true });
    refundRequest.mutate(refundMessage, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["me", "order", orderId] });
        flashMessage_Success(data.message);
        setRefundDialogue({ open: false, disable: false });
        setRefundMessage("");
        setRefundError("");
      },
      onError: (err) => {
        flashMessage_Failed(err.message);
        setRefundDialogue({ open: false, disable: false });
        setRefundMessage("");
        setRefundError("");
      },
    });
  };

  useEffect(() => {
    setStatus(data?.order.status ?? "");
  }, [data?.order.status]);

  const onUpdateStatusConfirm = () => {
    orderUpdate.mutate(status, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "order"] });
        flashMessage_Success("Update order status success");
      },
      onError: (err) => {
        //console.log(err);
        queryClient.invalidateQueries({ queryKey: ["admin", "order"] });
        flashMessage_Failed(err.message);
      },
    });
  };

  if (orderQuery.isPending) {
    return <Loading />;
  }

  if (orderQuery.isError || !data || !data.order) {
    flashMessage_Failed("Invalid order");
    navigate(isAdmin ? "/admin/orders" : "/orders", { replace: true });
    return;
  }

  // Refund only available to customers on completed orders that haven't
  // already been refunded, canceled, or expired before payment
  const allowToRefund =
    !isAdmin &&
    !data.order.refund_status &&
    data.order.status !== "pending" &&
    data.order.status !== "expired" &&
    data.order.status !== "canceled" &&
    data.order.status !== "refunded";

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-5xl">
        <div className="block text-center mb-5">
          <h2 className="text-2xl">Order</h2>
        </div>

        <div className="flex flex-col md:flex-col md:gap-12 justify-center items-center">
          <OrderReference orderInfo={data.order} isAdmin={isAdmin} />

          {isAdmin && (
            <div className="w-5/6 ms-auto md:ms-0 md:w-7/12 lg:w-8/12">
              <CustomerInfo
                orderInfo={data.order}
                status={status}
                onStatusChange={setStatus}
              />
            </div>
          )}
          <div className="">
            <OrderItemList items={data.orderItems}></OrderItemList>
          </div>
        </div>
        {/* only admin are allow to see the update status button */}
        {isAdmin && (
          <div className="text-center mt-10 flex flex-col justify-center items-center md:flex-row md:gap-5">
            <Button
              type="button"
              className="cursor-pointer max-w-50"
              disabled={orderUpdate.isPending}
              onClick={() => onUpdateStatusConfirm()}
            >
              UpdateStatus
            </Button>
          </div>
        )}
        {allowToRefund && (
          <div className="text-center my-10 flex flex-col justify-center items-center md:flex-row md:gap-5">
            <PopupDialogue
              title="Request Refund"
              trigger={
                <Button
                  type="button"
                  className="cursor-pointer max-w-50"
                  // close the refund dialogue right after request refund click
                  onClick={() =>
                    setRefundDialogue((prev) => ({ ...prev, open: false }))
                  }
                >
                  Reqeust Refund
                </Button>
              }
              onCancel={() => {
                setRefundMessage("");
                setRefundError("");
              }}
              content={
                <div className="w-full">
                  <Textarea
                    className="max-w-[25rem] max-h-[20rem] text-wrap"
                    name=""
                    value={refundMessage}
                    onChange={(e) => onRefundMessageChanged(e.target.value)}
                  ></Textarea>

                  <div className="text-red-500">{refundError}</div>
                </div>
              }
              triggerClassName="cursor-pointer bg-white hover:bg-white"
              onConfirm={() => onRefundConfirm()}
              open={refundDialogue.open}
              onOpenChange={(open) => {
                setRefundDialogue((prev) => ({ ...prev, open }));
              }}
              disableButton={refundDialogue.disable}
            ></PopupDialogue>
          </div>
        )}
      </div>
    </div>
  );
}
