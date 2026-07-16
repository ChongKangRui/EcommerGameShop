import {type CartItem} from "./cart"

export interface OrderItemResponse extends CartItem {
    order_item_id: string
}

export interface OrderConfirmResponse{
    status: string;
    payment_ref: string;
}