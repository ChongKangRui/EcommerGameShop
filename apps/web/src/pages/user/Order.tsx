
import { flashMessage_Failed } from "@/lib/flash";
import { useNavigate, useParams } from "react-router";

import OrderInfo from "@/components/order/OrderInfo";




export default function Order() {
  const { orderId } = useParams<{ orderId: string }>();

  const navigate =  useNavigate();
    console.log(orderId);
  if(!orderId){
    flashMessage_Failed("Invalid order");
    navigate("/orders", {replace: true});
    return;
  }

 
  return (
    <OrderInfo orderId={orderId} isAdmin={false}/>
  );
}
