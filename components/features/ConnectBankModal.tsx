import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loader2, Building2, Smartphone, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConnectBankModalProps {
  onSuccess: () => void;
}

const BANKS = [
  { id: "hdfc", name: "HDFC Bank", logo: "🏦" },
  { id: "sbi", name: "State Bank of India", logo: "🏛️" },
  { id: "icici", name: "ICICI Bank", logo: "🏢" },
  { id: "axis", name: "Axis Bank", logo: "🏧" },
];

export function ConnectBankModal({ onSuccess }: ConnectBankModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [discoveredAccount, setDiscoveredAccount] = useState<any>(null);

  const reset = () => {
    setStep(1);
    setMobile("");
    setOtp("");
    setSelectedBank(null);
    setDiscoveredAccount(null);
    setLoading(false);
  };

  const handleSendOtp = () => {
    if (mobile.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  const handleSelectBank = (bank: any) => {
    setSelectedBank(bank);
    setLoading(true);
    // Simulate discovery
    setTimeout(() => {
      setDiscoveredAccount({
        accountNumber: "XXXXXXXX" + Math.floor(1000 + Math.random() * 9000),
        ifsc: bank.id.toUpperCase() + "0001234",
        type: "Savings Account"
      });
      setLoading(false);
      setStep(4);
    }, 2000);
  };

  const handleConsent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bank/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: selectedBank.name,
          accountNumber: discoveredAccount.accountNumber,
          ifsc: discoveredAccount.ifsc
        })
      });
      
      if (res.ok) {
        setStep(5); // Success
        setTimeout(() => {
          setIsOpen(false);
          onSuccess();
          reset();
        }, 2000);
      } else {
        alert("Failed to connect");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { setIsOpen(open); if(!open) reset(); }}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Building2 className="w-4 h-4 mr-2" />
          Connect Bank Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-slate-950 text-white border-white/10 p-0 overflow-hidden">
        <div className="bg-[#1a1f2e] p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">S</div>
            <span className="font-semibold">Setu AA</span>
          </div>
          <div className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">Secured by RBI</div>
        </div>

        <div className="p-6 min-h-[350px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Login to Account Aggregator</h3>
                  <p className="text-sm text-muted-foreground">Enter your mobile number linked with your bank accounts.</p>
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <div className="flex gap-2">
                    <div className="bg-white/5 border border-white/10 rounded px-3 py-2 text-muted-foreground">+91</div>
                    <Input 
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="bg-white/5 border-white/10"
                      maxLength={10}
                    />
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={handleSendOtp} disabled={mobile.length < 10 || loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get OTP"}
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Verify OTP</h3>
                  <p className="text-sm text-muted-foreground">Enter the 4-digit code sent to +91 {mobile}</p>
                </div>
                <div className="flex justify-center gap-4 my-8">
                  <Input 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="bg-white/5 border-white/10 text-center text-2xl tracking-[1em] w-48"
                    maxLength={4}
                    placeholder="••••"
                  />
                </div>
                <Button className="w-full" onClick={handleVerifyOtp} disabled={otp.length < 4 || loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                </Button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Select Your Bank</h3>
                  <p className="text-sm text-muted-foreground">Choose the bank you want to connect.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {BANKS.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => handleSelectBank(bank)}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary/50 transition-all flex flex-col items-center gap-2"
                    >
                      <span className="text-2xl">{bank.logo}</span>
                      <span className="text-sm font-medium">{bank.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Review Consent</h3>
                  <p className="text-sm text-muted-foreground">Authorize Saksham OS to access your financial data.</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selectedBank?.logo}</span>
                      <div>
                        <p className="font-medium">{selectedBank?.name}</p>
                        <p className="text-xs text-muted-foreground">{discoveredAccount?.type} • {discoveredAccount?.accountNumber}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Requested</p>
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Account Summary</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Transaction History (12 Months)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Profile Information</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" onClick={handleConsent} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Approve & Connect
                </Button>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full py-12 text-center"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Account Linked!</h3>
                <p className="text-muted-foreground">Redirecting you back to Saksham OS...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
