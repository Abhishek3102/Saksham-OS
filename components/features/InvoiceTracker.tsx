"use client";

import { useEffect, useState } from "react";
import { getInvoices, Invoice } from "@/lib/data-service";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function InvoiceTracker() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const loadInvoices = async () => {
      const data = await getInvoices();
      // Take top 5 overdue
      setInvoices(data.slice(0, 5));
    };
    loadInvoices();
  }, []);

  return (
    <Card className="glass-card p-6 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Collections Agent
        </h3>
        <span className="text-xs text-muted-foreground">Tracking Overdue...</span>
      </div>

      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {invoices.map((invoice, index) => (
          <motion.div
            key={invoice.invoice_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-between group"
          >
            <div>
              <h4 className="font-semibold text-sm mb-1">{invoice.client_name}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Due: {invoice.due_date}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-white">₹{parseInt(invoice.amount).toLocaleString()}</p>
              <button className="text-xs text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Send Notice
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
