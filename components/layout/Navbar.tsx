"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter">
          Saksham<span className="text-primary">OS</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Agents
          </Link>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <AuthButtons />
        </div>
      </div>
    </motion.nav>
  );
}

function AuthButtons() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        {!session.user?.isBankConnected && (
            <Button className="bg-purple-600 hover:bg-purple-500 text-white border-none">
            Connect Bank Account
            </Button>
        )}
        <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-white">
                {session.user?.name?.charAt(0) || "U"}
            </div>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/auth/login">
        <Button variant="ghost" size="sm">Login</Button>
      </Link>
      <Link href="/auth/register">
        <Button size="sm">Get Started</Button>
      </Link>
    </>
  );
}
