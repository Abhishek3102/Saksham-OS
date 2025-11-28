"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Briefcase, User, Mail, Calendar, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function MyHiresPage() {
  const [hires, setHires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHires = async () => {
      try {
        const res = await fetch("/api/client/hires");
        if (res.ok) {
          const data = await res.json();
          setHires(data);
        }
      } catch (error) {
        console.error("Failed to fetch hires", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHires();
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="mb-8">
            <h1 className="text-3xl font-bold">My Hires</h1>
            <p className="text-muted-foreground">Manage your active contracts and view past work.</p>
        </header>

        {loading ? (
            <div className="flex justify-center py-12">
                <p>Loading hires...</p>
            </div>
        ) : hires.length === 0 ? (
            <Card className="text-center py-12">
                <CardContent>
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <User size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Hires Yet</h3>
                    <p className="text-muted-foreground mb-6">You haven't hired any freelancers yet.</p>
                    <Link href="/client/find-freelancer">
                        <Button>Find Talent</Button>
                    </Link>
                </CardContent>
            </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hires.map((job) => (
                    <Card key={job._id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant={job.status === "Completed" ? "secondary" : "default"}>
                                    {job.status === "Completed" ? <CheckCircle size={14} className="mr-1" /> : <Clock size={14} className="mr-1" />}
                                    {job.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <CardTitle className="line-clamp-1" title={job.title}>{job.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                <Briefcase size={14} /> {job.job_category}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {job.freelancerName?.charAt(0) || "U"}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-medium truncate">{job.freelancerName}</p>
                                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                        <Mail size={10} /> {job.freelancerEmail || "No email"}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                    <p className="text-xs text-muted-foreground">Budget</p>
                                    <p className="font-medium">${job.budget_min} - ${job.budget_max}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                    <p className="text-xs text-muted-foreground">Deadline</p>
                                    <p className="font-medium">
                                        {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                            <Link href={`/jobs/${job._id}`} className="w-full">
                                <Button variant="outline" className="w-full">View Contract</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}
