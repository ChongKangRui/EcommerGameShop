
import { flashMessage_Failed } from "@/lib/flash";
import { useNavigate, useParams } from "react-router";

import RefundInfo from "@/components/admin/refund/RefundInfo";




export default function AdminRefund() {
  const { orderId } = useParams<{ orderId: string }>();
  
  const navigate =  useNavigate();

  if(!orderId){
    flashMessage_Failed("Invalid order");
    navigate("/admin/refunds", {replace: true});
    return;
  }

 
  return (
    <RefundInfo orderId={orderId}/>
  );
}
