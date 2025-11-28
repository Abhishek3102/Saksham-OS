"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { JobFeed } from "@/components/features/JobFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Target, Zap, FileText } from "lucide-react";

export default function GrowthPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Growth Hub</h1>
          <p className="text-muted-foreground">Hunter Agent is scanning for opportunities matching your financial gap.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Financial Gap</span>
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">₹45,000</div>
              <p className="text-xs text-muted-foreground mt-1">Needed this month to hit goals.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Active Proposals</span>
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-1">3 viewed by clients.</p>
            </CardContent>
          </Card>

          <Card>
             <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Win Rate</span>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">12%</div>
              <p className="text-xs text-muted-foreground mt-1">Top 5% of freelancers.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">High-Match Opportunities</h2>
              <Badge variant="outline">Auto-Apply Active</Badge>
            </div>
            <JobFeed />
          </div>

          <div className="space-y-6">
            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-base">Hunter Agent Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Scanning Upwork (API)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Scanning LinkedIn Jobs</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Analyzing Freelancer.com (Rate Limited)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
