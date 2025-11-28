"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
  amount: number;
  currency?: string;
  onSuccess: (response: any) => void;
  onFailure?: (error: any) => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PaymentModal({ 
  amount, 
  currency = "INR", 
  onSuccess, 
  onFailure,
  trigger,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange
}: PaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle controlled/uncontrolled state
  const show = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;
  const setShow = controlledOnOpenChange || setIsOpen;

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create Order
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });
      
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create order");
      }

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RkdPvdOGFBltPZ", // Fallback for dev
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Saksham OS",
        description: "Job Posting Fee",
        order_id: data.order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success("Payment successful!");
              onSuccess(response);
              setShow(false);
            } else {
              toast.error("Payment verification failed");
              if (onFailure) onFailure(verifyData);
            }
          } catch (error) {
            toast.error("Payment verification error");
            if (onFailure) onFailure(error);
          }
        },
        prefill: {
          name: "Saksham User",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
            ondismiss: function() {
                setLoading(false);
            }
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
      
      // We don't set loading false here because the modal is open
      // It will be set false on dismiss or success/failure

    } catch (error: any) {
      console.error("Payment Error:", error);
      toast.error(error.message || "Something went wrong");
      setLoading(false);
      if (onFailure) onFailure(error);
    }
  };

  return (
    <>
      {trigger && <div onClick={() => setShow(true)}>{trigger}</div>}
      
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Pay securely via Razorpay to proceed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-blue-500/10 rounded-full text-blue-500">
                <CreditCard size={48} />
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold">
                    {currency === 'INR' ? '₹' : currency} {amount}
                </p>
                <p className="text-sm text-slate-400">Total Amount</p>
            </div>
          </div>

          <Button onClick={handlePayment} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Pay Now
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
