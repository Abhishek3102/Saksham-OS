"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Shield, Zap, TrendingUp, Lock } from "lucide-react";

import { useEffect, useState } from "react";
import { getFinancialStats, FinancialStats } from "@/lib/data-service";

export default function LandingPage() {
  const [stats, setStats] = useState<FinancialStats>({ revenue: 0, taxSaved: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const data = await getFinancialStats();
      setStats(data);
    };
    loadStats();
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="absolute inset-0 bg-background/80 z-10" /> {/* Overlay for readability */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/assets/video_preview_h264.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="absolute inset-0 bg-hero-glow opacity-20 blur-[100px] animate-pulse-slow z-0" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
                  The First Agentic OS for Freelancers
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight"
              >
                Your Financial <br />
                <span className="text-gradient">Autopilot</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-muted-foreground max-w-xl"
              >
                Stop losing 40% of your time to chaos. Saksham OS actively earns, manages, and protects your money while you sleep.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/onboarding">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                    Connect Bank Account
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                    Watch Demo
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Shield className="w-4 h-4 text-green-500" />
                <span>RBI-Regulated Account Aggregator. Read-only access.</span>
              </motion.div>
            </div>

            <div className="lg:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10"
              >
                <div className="relative w-full aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-full blur-3xl animate-pulse-slow" />
                  <Image
                    src="/assets/dashboard-main.png"
                    alt="Saksham OS Dashboard"
                    width={600}
                    height={600}
                    className="rounded-2xl shadow-2xl border border-white/10 relative z-10 object-cover"
                  />
                  {/* Floating Elements */}
                  <motion.div 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-10 -right-10 z-20"
                  >
                    <Card className="w-64 p-4 glass-card border-primary/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="text-lg font-bold text-green-400">
                            {stats.revenue > 0 ? `+₹${stats.revenue.toLocaleString()}` : 'Loading...'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-10 -left-10 z-20"
                  >
                    <Card className="w-64 p-4 glass-card border-accent/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Action</p>
                          <p className="text-sm font-medium">
                            Tax Saved: {stats.taxSaved > 0 ? `₹${stats.taxSaved.toLocaleString()}` : 'Loading...'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-black/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">The Autonomous <span className="text-gradient">C-Suite</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Replace your chaos with a team of specialized AI agents working 24/7.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8 text-primary" />}
              title="Hunter Agent"
              description="Actively scans the web for gigs matching your financial gap and drafts personalized proposals."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-secondary" />}
              title="CFO Agent"
              description="Ensures solvency by executing Smart Splits, locking tax money immediately upon receipt."
            />
            <FeatureCard 
              icon={<Lock className="w-8 h-8 text-accent" />}
              title="Collections Agent"
              description="Monitors unpaid invoices and sends automated, legally-sound reminders to clients."
            />
          </div>
        </div>
      </section>

      {/* Platform Preview Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for <span className="text-gradient">Growth</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience a seamless interface designed to keep you focused on what matters.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="group relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3]"
            >
              <Image
                src="/assets/smart-calendar.png"
                alt="Smart Calendar"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-xl font-bold text-white mb-2">Smart Scheduling</h3>
                <p className="text-sm text-gray-300">Automated calendar management for your gigs.</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="group relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3]"
            >
              <Image
                src="/assets/notifications-platform.png"
                alt="Notifications"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-xl font-bold text-white mb-2">Intelligent Alerts</h3>
                <p className="text-sm text-gray-300">Never miss a deadline or payment with smart notifications.</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="group relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] md:col-span-2 lg:col-span-1"
            >
              <Image
                src="/assets/dashboard-overview.png"
                alt="Dashboard Overview"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-xl font-bold text-white mb-2">Comprehensive Dashboard</h3>
                <p className="text-sm text-gray-300">All your financial health metrics in one place.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="glass-card p-8 rounded-2xl hover:border-primary/50 transition-colors"
    >
      <div className="mb-6 p-4 bg-white/5 rounded-xl w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
