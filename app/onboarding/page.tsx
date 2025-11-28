"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Building, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    // Simulate API call to connect bank
    setTimeout(async () => {
      try {
        // Update user in DB
        const res = await fetch("/api/user/update-bank-status", {
            method: "POST",
        });
        
        if (res.ok) {
            await update({ isBankConnected: true }); // Update session
            setStep(2);
            toast.success("Bank Account Connected Successfully!");
        } else {
            toast.error("Failed to connect bank account.");
        }
      } catch (e) {
        console.error(e);
        toast.error("An error occurred.");
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  const handleComplete = () => {
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">
            {step === 1 ? "Connect Your Bank" : "You're All Set!"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Building className="w-10 h-10 text-blue-500" />
                </div>
              </div>
              <p className="text-center text-slate-400">
                Link your primary bank account to enable automated payments, invoicing, and tax saving features.
              </p>
              <Button 
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-500" 
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? "Connecting..." : "Connect via Plaid / Stripe"}
              </Button>
              <button 
                onClick={() => router.push("/home")}
                className="w-full text-sm text-slate-500 hover:text-slate-400"
              >
                Skip for now
              </button>
            </motion.div>
          ) : (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
            >
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <p className="text-slate-400">
                Your account is now connected. Saksham OS is ready to manage your finances.
              </p>
              <Button 
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-500" 
                onClick={handleComplete}
              >
                Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
