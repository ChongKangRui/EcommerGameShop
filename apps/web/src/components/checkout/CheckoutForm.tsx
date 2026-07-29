import { useState } from "react";

import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import OrderSummary from "@/components/checkout/OrderSummary";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import { useNavigate } from "react-router";
import { useCart } from "@/hooks/useCart";
import Loading from "../Loading";

import { useOrderStatusValidation } from "@/hooks/useOrder";

type CheckoutFormProp = {
  orderId: string;
};

export default function CheckoutForm({ orderId }: CheckoutFormProp) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, isLoading } = useCart();

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const orderValidation = useOrderStatusValidation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(undefined);
    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      // Show error to your customer
      setErrorMessage(submitError.message);
      setIsProcessing(false);
      return;
    }

    if (stripe) {
      const { error } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          payment_method_data: {
            billing_details: {
              name: `${user?.first_name} ${user?.last_name}`,
              email: user?.email,
            },
          },
        },
      });

      if (!error) {
        console.log("No error from stripe");
        navigate(`/order-confirmation/${orderId}`, { replace: true });
      } else {
        console.log(" error from stripe");

        // validate if order still valid, not expired
        orderValidation.mutate(orderId, {
          onSuccess: (data) => {
            console.log("validate data success??", data);

            if (!data.valid) {
              navigate(`/order-confirmation/${orderId}`, {
                replace: true,
                state: { status: "invalid_order" },
              });
              
            } else {
              
              navigate(`/order-confirmation/${orderId}`, {
                replace: true,
              });
             
            }
          },
          onError: (err) => {
            
            navigate(`/order-confirmation/${orderId}`, {
                replace: true,
                state: { status: "invalid_order" },
              });
            console.log(err);
          },
        });
      }

    }
  };

  if (isLoading) {
    return <Loading></Loading>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col items-center justify-center  md:flex-row md:gap-12  md:items-start">
        {/* Payment details */}
        <div className="max-w-sm w-full md:w-1/2">
          <h2 className="text-2xl font-bitcount mb-5">Payment details</h2>
          <PaymentElement />
        </div>

        {/* Divider — vertical on desktop, horizontal on mobile */}
        <div className="hidden md:block w-px bg-gray-300 self-stretch" />
        <hr className="md:hidden w-full my-6" />

        {/* Order summary */}
        <div className="max-w-sm w-full md:w-1/2 mt-6 md:mt-0">
          <OrderSummary items={items} />
        </div>
      </div>

      <div className="text-center mt-10">
        <Button
          className="cursor-pointer"
          type="submit"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? "Processing..." : "Pay now"}
        </Button>
      </div>

      {errorMessage && (
        <p className="text-center text-destructive mt-4">{errorMessage}</p>
      )}
    </form>
  );
}
