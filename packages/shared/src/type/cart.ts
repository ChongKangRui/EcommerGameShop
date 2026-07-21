export interface CartItem {
  variation_id: string;
  quantity: number;
}

export type CartItemResponse = {
  cart_id: string;
  product_id: number;
  is_active: boolean;
  variation_id: string;   
  name: string;
  image_url: string;
  stock:number;  
  label: string;
  final_price: number;
  quantity: number;
  
}

export type CartItemsResponse = {
  cartItems: CartItemResponse[];
  adjusted?: boolean;
  
}