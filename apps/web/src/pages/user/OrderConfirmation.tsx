import Loading from "@/components/Loading";

import { useOrderConfirm } from "@/hooks/useOrder";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();

  console.log(orderId);
  const queryClient = useQueryClient();
  const orderConfirm = useOrderConfirm();
  
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  const timerRef = useRef<ReturnType<typeof setInterval>>(0);

  // confirm order from database, then once confirm, show message say payment success
  // put a timer for redirect
  // or let user click the link to redirect
  useEffect(() => {
   
    orderConfirm.mutate(orderId ?? "", {
      onSuccess: (d) => {
        console.log(d.status);
        if (d.status === 'paid') {
          queryClient.invalidateQueries({ queryKey: ["cart", "user"] });
          queryClient.invalidateQueries({ queryKey: ["products"] });
          setPaymentSuccess(true);
        }
        else if(d.status === 'pending'){
          setPaymentSuccess(false);
        }

        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              navigate("/", { replace: true });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      },
    });
    return () => clearInterval(timerRef.current);
  }, []);

  if (orderConfirm.isPending) {
    return <Loading></Loading>;
  }

  return (
    // <div>
    //   { paymentSuccess ? (
    //     <h1>Payment Successful!</h1>
    //   ) : (
    //     <h1>Payment Failed</h1>
    //   )}
    // </div>
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {paymentSuccess ? (
          <>
            {/* <div className="text-green-500 text-6xl mb-4"></div> */}
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">Thank you for your purchase.</p>
          </>
        ) : (
          <>
            {/* <div className="text-red-500 text-6xl mb-4">✗</div> */}
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-6">
              Please try again or contact support.
            </p>
          </>
        )}

        <p className="text-sm text-gray-400">Redirecting in {countdown}s</p>
        <button
          onClick={() => navigate("/", { replace: true })}
          className="text-blue-500 underline text-sm mt-1 cursor-pointer"
        >
          Go to Home now
        </button>
      </div>
    </div>
  );
}
