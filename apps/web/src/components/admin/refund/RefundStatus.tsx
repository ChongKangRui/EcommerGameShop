
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";


import type {
  AdminOrderTypeEnum,
} from "@ecom/shared/src/type/order";
import { type RefundRow } from "@ecom/shared/src/type/refund";

type RefundStatusProps = {
  refundInfo: RefundRow;
  status: string;
  onStatusChange: (newStatus: string) => void;
  refundAmount: number;
  onRefundAmountChange: (newRefundAmount: number) => void;
};

export default function RefundStatus({
  refundInfo,
  status,
  onStatusChange,
  refundAmount,
  onRefundAmountChange,
}: RefundStatusProps) {
console.log(refundInfo.amount);

  return (
    <div className=" grid grid-cols-6 col-span-full text-center gap-5">
      <p className="col-span-6">Requested by: {refundInfo.requested_by} </p>
      <p className="col-span-6">Reason: </p>
      <p className="col-span-6 border rounded-2xl border-gray-600 min-h-20 flex items-center justify-center">
        {refundInfo.reason}
      </p>

      <div className="col-span-3 flex justify-center items-center">
        <p>Refund Status: </p>
        <Select
          defaultValue={status}
          onValueChange={(e) => {
            if (e) {
              onStatusChange?.(e as AdminOrderTypeEnum);
            }
          }}
          disabled={refundInfo.status !== "pending"}
        >
          <SelectTrigger id="orderStatus">
            <SelectValue>{status}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"rejected"}>rejected</SelectItem>
            <SelectItem value={"approved"}>approved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-3 flex justify-center items-center">
        <p>Refund Amount: </p>
        <Input type="number" disabled={refundInfo.status !== "pending"}
         step={1} value={refundAmount} max={refundInfo.amount} 
         onChange={(e)=>{onRefundAmountChange( Number(e.target.value))}}></Input>
      </div>

      <hr className="col-span-6" />
    </div>
  );
}
