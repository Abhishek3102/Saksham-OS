import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Sidebar } from "@/components/layout/Sidebar";
import { JobFeed } from "@/components/features/JobFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Target, TrendingUp, Activity } from "lucide-react";
import { findMatches } from "@/lib/agents/hunter";
import Notification from "@/models/Notification";
import dbConnect from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions as any);
  if (!session) {
      redirect("/auth/login");
  }
  
  const userId = (session.user as any).userId || (session.user as any).id;

  await dbConnect();

  // Fetch matches
  let matches: any[] = [];
  try {
      matches = await findMatches(userId);
  } catch (e) {
      console.error("Error finding matches:", e);
  }
  
  // Fetch notifications to check for drafts
  const notifications = await Notification.find({ 
      recipientId: userId, 
      type: "job_match" 
  }).lean();

  const draftJobIds = new Set(notifications.map((n: any) => n.relatedJobId));

  const jobsWithDrafts = matches.map((job: any) => ({
      ...job,
      hasDraft: draftJobIds.has(job.job_id || job._id),
      match_score: 95 // Mock or calculate
  }));

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Growth Autopilot: Active & Scanning.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Widget 1: Active Pursuit */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Active Pursuit</span>
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">8 Bids</div>
              <p className="text-xs text-muted-foreground mt-1">Potential Value: ₹1.2L</p>
            </CardContent>
          </Card>
          
          {/* Widget 2: Market Demand */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Market Demand</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-end gap-2 h-10 mt-2">
                 <div className="w-8 bg-blue-500/20 h-full rounded-t relative group">
                    <div className="absolute bottom-0 w-full bg-blue-500 h-[80%] rounded-t"></div>
                 </div>
                 <div className="w-8 bg-blue-500/20 h-full rounded-t relative group">
                    <div className="absolute bottom-0 w-full bg-blue-500 h-[60%] rounded-t"></div>
                 </div>
                 <div className="w-8 bg-blue-500/20 h-full rounded-t relative group">
                    <div className="absolute bottom-0 w-full bg-blue-500 h-[90%] rounded-t"></div>
                 </div>
                 <div className="w-8 bg-blue-500/20 h-full rounded-t relative group">
                    <div className="absolute bottom-0 w-full bg-blue-500 h-[40%] rounded-t"></div>
                 </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">React & Node.js in high demand.</p>
            </CardContent>
          </Card>

          {/* Widget 3: Income Forecast */}
          <Card>
             <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Income Forecast</span>
                <Activity className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold">₹85,000</div>
              <p className="text-xs text-muted-foreground mt-1">Based on 12% win rate.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Job Feed</h2>
              <Badge variant="outline">Live Scanning</Badge>
            </div>
            <JobFeed initialJobs={jobsWithDrafts} />
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
