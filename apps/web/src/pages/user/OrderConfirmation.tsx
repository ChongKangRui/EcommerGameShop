import Loading from "@/components/Loading";

import { useOrderConfirm } from "@/hooks/useOrder";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useLocation } from "react-router-dom";

const failureMessage : Record<string, string> = {

  invalid_order: "Order expired.",
};

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();

  const queryClient = useQueryClient();
  const orderConfirm = useOrderConfirm();

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  const location = useLocation();
  const { status } = location.state || {};

  const timerRef = useRef<ReturnType<typeof setInterval>>(0);

const startCountDown = () =>
  setInterval(() => {
    setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
  }, 1000);


  useEffect(() => {
  if (countdown === 0) {
    clearInterval(timerRef.current);
    navigate("/", { replace: true });
  }
}, [countdown, navigate]);


  // Show message for order expired/payment success/payment failed
  // put a timer for redirect
  // or let user click the link to redirect
  useEffect(() => {
    if (status === "invalid_order") {
      timerRef.current = startCountDown();
      return;
    }
    //console.log("Status invalid");
    orderConfirm.mutate(orderId ?? "", {
      onSuccess: (d) => {
        //console.log(d.status);
        if (d.status === "paid") {
          queryClient.invalidateQueries({ queryKey: ["cart", "user"] });
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["me","order"] });
          setPaymentSuccess(true);
        } else {
          setPaymentSuccess(false);
        }

        timerRef.current = startCountDown();
      },
      onError: (err)=>{
        //console.log(err);
      }
    });
    return () => clearInterval(timerRef.current);
  }, []);

  if (orderConfirm.isPending) {
    return <Loading></Loading>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
       {status !== "invalid_order" && ((paymentSuccess) ? (
          <>
            {/* <div className="text-green-500 text-6xl mb-4"></div> */}
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              {status === 'last_pay_unresolved' ? "Your last payment was successful!" : "Payment Successful!"}
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
        ))}
        {status === "invalid_order" && (
          <>
            {/* <div className="text-red-500 text-6xl mb-4">✗</div> */}
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              {failureMessage[status]}
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
