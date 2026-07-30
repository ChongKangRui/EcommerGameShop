
import { parseDateToLocal } from "@/lib/utils";

import type {
 
  OrderWithCustomer,
} from "@ecom/shared/type/order";

type CustomerInfoProps = {
  orderInfo: OrderWithCustomer;
  isAdmin: boolean
};

export default function OrderReference({ orderInfo, isAdmin }: CustomerInfoProps) {
  console.log(orderInfo);
  return (
    <div className=" grid grid-cols-6 col-span-full text-center gap-5">
      <p className="col-span-6">Order Id: {orderInfo.order_id}</p>
      {isAdmin && <p className="col-span-6">User Id: {orderInfo.user_id}</p>}
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

      {!isAdmin && <p className="col-span-6">Order Status: {orderInfo.status} </p>}
      {!isAdmin && <p className="col-span-6">Total: RM {orderInfo.total_amount} </p>}
       {!isAdmin && orderInfo.refund_status && (<p className="col-span-6 text-red-500">Refund status: {orderInfo.refund_status} </p>)}
      {!isAdmin && orderInfo.refund_status === 'approved' && (<p className="col-span-6 text-red-500">Refund amount: {orderInfo.refund_amount} </p>)}

      <hr className="col-span-6 my-2" />
    </div>
  );
}
