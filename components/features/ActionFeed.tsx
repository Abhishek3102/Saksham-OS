"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

type Action = {
  id: string;
  agent: "Hunter" | "CFO" | "Tax" | "Collections" | "Productivity";
  message: string;
  timestamp: string;
  status: "success" | "warning" | "info";
};

const initialActions: Action[] = [
  { id: "1", agent: "Hunter", message: "Scanned 45 new gigs. Found 3 high-match opportunities.", timestamp: "10:42 AM", status: "success" },
  { id: "2", agent: "CFO", message: "Incoming payment of ₹50,000 detected from Client A.", timestamp: "10:45 AM", status: "success" },
  { id: "3", agent: "CFO", message: "Locked ₹15,000 (30%) for Tax Buffer.", timestamp: "10:45 AM", status: "info" },
  { id: "4", agent: "Tax", message: "Flagged 'Starbucks' transaction as potential client meeting expense.", timestamp: "11:15 AM", status: "warning" },
];

export function ActionFeed() {
  const [actions, setActions] = useState<Action[]>(initialActions);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newAction: Action = {
        id: Date.now().toString(),
        agent: "Productivity",
        message: "Blocked 2 hours for Deep Work based on deadline proximity.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "info"
      };
      setActions(prev => [newAction, ...prev]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-[400px] flex flex-col border-primary/20 bg-black/40">
      <CardHeader className="border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <CardTitle className="text-base font-mono">Live Agent Feed</CardTitle>
          <div className="ml-auto flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {actions.map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 text-sm"
            >
              <div className="mt-0.5">
                {action.status === "success" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {action.status === "warning" && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                {action.status === "info" && <Clock className="w-4 h-4 text-blue-500" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                    action.agent === "Hunter" ? "bg-purple-500/20 text-purple-400" :
                    action.agent === "CFO" ? "bg-green-500/20 text-green-400" :
                    action.agent === "Tax" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    {action.agent}
                  </span>
                  <span className="text-xs text-muted-foreground">{action.timestamp}</span>
                </div>
                <p className="text-muted-foreground">{action.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
