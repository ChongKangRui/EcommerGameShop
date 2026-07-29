import {type CartItem} from "./cart"

export type CartValidateResult={
    validationPass: boolean,
    message: string
}

export type CheckoutResponse= {
    
    orderId: string;
    clientSecret: string;
    ReconcileResult: ReconcileResult;
}

export type ReconcileResult = 'paymentUnresolved' | 'createNewOrder' | 'reusePendingOrder';