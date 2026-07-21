import { useCart } from "@/hooks/useCart";
import Loading from "@/components/Loading";
import type { CartItem, CartItemResponse } from "@ecom/shared/src/type/cart";
import type { OrderItem } from "@ecom/shared/src/type/order";


type OrderItemProp = {
  items: OrderItem[]
}

export default function OrderItemList({items} : OrderItemProp) {
  //const { items, isLoading } = useCart();


  return (
    <div className="w-full max-w-[15em] md:max-w-lg">
      <h2 className="text-2xl mb-5 text-center">Items</h2>

      <div className="flex flex-col gap-4">
        {items.map((i: OrderItem) => (
          <div key={i.order_item_id} className="flex gap-3">
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
              RM {i.item_total_price}
            </span>
          </div>
        ))}
      </div>

      <hr className="my-5" />

    
    </div>
  );
}