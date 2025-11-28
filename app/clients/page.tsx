"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Users, AlertCircle, Mail, Clock } from "lucide-react";

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-muted-foreground">Collections Agent is monitoring 3 overdue invoices.</p>
        </header>

        <div className="space-y-8">
          {/* Wall of Shame */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-red-500">Wall of Shame (Overdue)</h2>
            </div>
            <div className="grid gap-4">
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold">
                      A
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Acme Corp</h3>
                      <p className="text-sm text-red-400">Overdue by 12 days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹45,000</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="danger">Send Legal Notice</Button>
                      <Button size="sm" variant="outline">View History</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-500/30 bg-orange-500/5">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold">
                      S
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Startup Inc</h3>
                      <p className="text-sm text-orange-400">Overdue by 3 days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹12,500</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="secondary">Send Firm Reminder</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Payment Watchlist */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Payment Watchlist</h2>
            </div>
            <div className="grid gap-4">
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      T
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">TechFlow Systems</h3>
                      <p className="text-sm text-muted-foreground">Due in 5 days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹80,000</p>
                    <Badge variant="outline" className="mt-2">Invoice Sent</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
