"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { ActionFeed } from "@/components/features/ActionFeed";
import { HealthBar } from "@/components/features/HealthBar";
import { RunwayCalculator } from "@/components/features/RunwayCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, AlertTriangle, Play, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // PUBLIC VIEW (Not Logged In)
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
         {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]"></div>
        </div>

        {/* Navbar Placeholder (Assuming Navbar is in Layout, but we want a clean hero here) */}
        {/* If Navbar is global, it will appear above. */}

        <main className="container mx-auto px-6 pt-32 pb-16 relative z-10 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-sm text-blue-400 mb-6">
                    The First Agentic OS for Freelancers
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    Your Financial <br />
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Autopilot
                    </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                    Stop losing 40% of your time to chaos. Saksham OS actively earns, manages, and protects your money while you sleep.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/auth/register">
                        <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
                            Get Started <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-slate-700 hover:bg-slate-800">
                        <Play className="mr-2 w-5 h-5 fill-current" /> Watch Demo
                    </Button>
                </div>

                {/* Feature Grid Preview */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                        <Shield className="w-10 h-10 text-blue-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Financial Guardian</h3>
                        <p className="text-slate-400">Automated tax saving, invoice tracking, and payment recovery.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                        <TrendingUp className="w-10 h-10 text-purple-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Growth Engine</h3>
                        <p className="text-slate-400">AI-driven job matching and skill gap analysis to boost earnings.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                        <Wallet className="w-10 h-10 text-green-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Smart Payments</h3>
                        <p className="text-slate-400">Seamless global transactions with lower fees and faster settlements.</p>
                    </div>
                </div>
            </motion.div>
        </main>
      </div>
    );
  }

  // PRIVATE VIEW (Logged In)
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Command Center</h1>
            <p className="text-muted-foreground">Welcome back, {session.user?.name || "User"}. Your agents are active.</p>
          </div>
          <div className="flex gap-4">
             {/* Actions moved to Navbar */}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <HealthBar />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RunwayCalculator />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-accent" />
                  <CardTitle className="text-base">Pending Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">3</div>
                <p className="text-xs text-muted-foreground mt-2">
                  2 Invoice Approvals, 1 Tax Classification.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
          <div className="lg:col-span-2 h-full">
            <ActionFeed />
          </div>
          <div className="space-y-6">
            {/* Mini Widgets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Income</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Upwork Client</p>
                          <p className="text-xs text-muted-foreground">Today, 10:45 AM</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-400">+₹50,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Retainer A</p>
                          <p className="text-xs text-muted-foreground">Yesterday</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-400">+₹25,000</span>
                    </div>
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Projected Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                   <TrendingUp className="w-4 h-4 text-primary" />
                   <span className="text-2xl font-bold">₹1.2L</span>
                </div>
                <p className="text-xs text-muted-foreground">Expected by end of month based on active contracts.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
