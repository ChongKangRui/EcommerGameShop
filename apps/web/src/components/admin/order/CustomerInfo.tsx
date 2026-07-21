import { useForm } from "react-hook-form";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { parseDateToLocal} from "@/lib/utils";
import { getOrderStatusAvailableUpdateOptions } from "@ecom/shared/src/type/order";
import type {
  AdminOrderTypeEnum,
  OrderWithCustomer,
} from "@ecom/shared/src/type/order";


type CustomerInfoProps = {
  orderInfo: OrderWithCustomer;
  status: string;
  onStatusChange: (newStatus: string) => void;
};


export default function CustomerInfo({
  orderInfo,
  status,
  onStatusChange,
}: CustomerInfoProps) {
  const availableStatusSelection = getOrderStatusAvailableUpdateOptions(status as AdminOrderTypeEnum);
  console.log(status);

  return (
    <div className=" grid grid-cols-6 col-span-full text-center gap-5">
      <p className="col-span-6">Order Id: {orderInfo.order_id}</p>
      <p className="col-span-6">User Id: {orderInfo.user_id}</p>
      <p className="col-span-6">Payment Ref: {orderInfo.payment_ref}</p>
      <p className="col-span-6">
        Created at: {parseDateToLocal(orderInfo.created_at)}
      </p>
      {orderInfo.status === "expired" && (
        <p className="col-span-6">
          Expires at:{parseDateToLocal(orderInfo.expires_at)}
        </p>
      )}
      <p className="col-span-6">
        Updated at: {parseDateToLocal(orderInfo.updated_at)}
      </p>
      <hr className="col-span-6 my-5" />

      <p className="col-span-6 truncate md:col-span-3">
        Name: {orderInfo.name}
      </p>
      <p className="col-span-6 md:col-span-3">Email: {orderInfo.email} </p>
      <p className="col-span-6">Adress: {orderInfo.address} </p>
      <p className="col-span-3">Total: RM {orderInfo.total_amount} </p>
      <div className="col-span-3 flex justify-center items-start">
        <p>Order Status: </p>
        <Select
          defaultValue={orderInfo.status}
          onValueChange={(e) => {
            if (e) {
              onStatusChange(e as AdminOrderTypeEnum);
            }
          }}
          disabled={availableStatusSelection?.length === 0}
        >
          <SelectTrigger id="orderStatus">
            <SelectValue>{status}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableStatusSelection?.map((s, i) => {
              return (
                <SelectItem key={s + i} value={s}>
                  {s}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
       <hr className="col-span-6" />
    </div>
  );
}
