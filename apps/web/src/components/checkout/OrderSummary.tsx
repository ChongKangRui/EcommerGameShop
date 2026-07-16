import { useCart } from "@/hooks/useCart";
import Loading from "@/components/Loading";
import type { CartItem, CartItemResponse } from "@ecom/shared/src/type/cart";


type OrderItemProp = {
  items: CartItemResponse[]
}

export default function OrderSummary({items} : OrderItemProp) {
  //const { items, isLoading } = useCart();

  const totalPrice = items.reduce(
    (sum: number, i: CartItemResponse) => sum + i.quantity * i.final_price,
    0,
  );

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bitcount mb-5">Order summary</h2>

      <div className="flex flex-col gap-4">
        {items.map((i: CartItemResponse) => (
          <div key={i.variation_id} className="flex gap-3">
            <img
              src={i.image_url}
              alt=""
              className="w-16 h-16 object-cover rounded shrink-0"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm truncate">{i.name}</span>
              {i.label && (
                <span className="text-xs text-gray-500">{i.label}</span>
              )}
              <span className="text-xs text-gray-500">Qty {i.quantity}</span>
            </div>
            <span className="text-sm whitespace-nowrap">
              RM {(i.quantity * i.final_price).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <hr className="my-5" />

      <div className="flex justify-between items-center text-lg">
        <span>Total</span>
        <span>RM {totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}