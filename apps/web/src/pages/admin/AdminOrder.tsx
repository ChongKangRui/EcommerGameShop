import { flashMessage_Failed } from "@/lib/flash";
import { useNavigate, useParams } from "react-router";

import OrderInfo from "@/components/order/OrderInfo";

export default function AdminOrder() {
  const { orderId } = useParams<{ orderId: string }>();

  const navigate = useNavigate();

  if (!orderId) {
    flashMessage_Failed("Invalid order");
    navigate("/admin/orders", { replace: true });
    return;
  }

  return <OrderInfo orderId={orderId} isAdmin={true} />;
}
