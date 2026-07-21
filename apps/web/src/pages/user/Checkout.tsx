import { useEffect, useRef } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Link } from "react-router";
import { loadStripe } from "@stripe/stripe-js";

import Loading from "@/components/Loading";

import CheckoutForm from "@/components/checkout/CheckoutForm";
import { useInitCheckout } from "@/hooks/useCheckout";
import { useQueryClient } from "@tanstack/react-query";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  console.log(stripePromise);
  const initCheckout = useInitCheckout();
  const hasInitiated = useRef(false);
  const queryClient = useQueryClient();

  // why use the useRef? as far as I know, strict mode in react will causing mount twice
  // useRef will prevent it from render twice since changing it doesnt cause rerender
  useEffect(() => {
    if (hasInitiated.current) return;
    hasInitiated.current = true;
    initCheckout.mutate(undefined, {
      onError: (err) => {
        hasInitiated.current = false; // allow retry
        console.log(err);
      },
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-5xl px-4">
        {/* Title */}
        <div className="block md:block text-center mb-5 md:-mt-15 md:mb-13">
          <Link className="text-5xl font-bitcount" to={"/"}>
            {"Redfield Gaming"}
          </Link>
          <h2 className="text-2xl font-bitcount mt-5">Checkout</h2>
        </div>

        {initCheckout.isPending && <Loading></Loading>}

        {initCheckout.isError && (
          <div className="text-center text-destructive mt-4">
             <p>
            {initCheckout.error?.message || "Unable to start checkout"}
          </p>
            <p>Please try refresh the page or contact the support.</p>
          </div>
         
          
        )}

        {initCheckout.data?.clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: initCheckout.data.clientSecret,
            }}
          >
            <CheckoutForm orderId={initCheckout.data?.orderId} />
          </Elements>
        )}
      </div>
    </div>
  );
}
