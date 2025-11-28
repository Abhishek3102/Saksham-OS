import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Bell, Briefcase, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function NotificationsPage() {
  await dbConnect();
  const session: any = await getServerSession(authOptions as any);

  if (!session || !session.user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
            <p>Please login to view notifications.</p>
        </div>
    );
  }

  const userId = session.user.userId || session.user.id;

  const notifications = await Notification.find({
      $or: [
          { recipientId: userId },
          { type: "job_post" }
      ]
  }).sort({ createdAt: -1 });

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="mb-8">
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your latest activities and job matches.</p>
        </header>

        <div className="space-y-4 max-w-3xl">
            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No new notifications.</p>
                    </CardContent>
                </Card>
            ) : (
                notifications.map((notif: any) => (
                    <Card key={notif._id} className={`border-l-4 ${notif.read ? 'border-l-slate-500 opacity-70' : 'border-l-blue-500'}`}>
                        <CardContent className="p-4 flex items-start gap-4">
                            <div className={`p-2 rounded-full ${['job_match', 'job_post', 'job_bid'].includes(notif.type) ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                {['job_match', 'job_post', 'job_bid'].includes(notif.type) ? <Briefcase size={20} /> : <Bell size={20} />}
                            </div>
                            <div className="flex-1">
                                {notif.type === 'job_post' ? (
                                    <div>
                                        <h3 className="font-semibold text-lg">{notif.title}</h3>
                                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground my-1">
                                            <span className="bg-secondary px-2 py-0.5 rounded text-xs">{notif.job_category}</span>
                                            <span>{notif.currency} {notif.budget_min} - {notif.budget_max}</span>
                                            <span>• {notif.experience_level}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{notif.job_description}</p>
                                        {notif.skills && notif.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {notif.skills.slice(0, 3).map((skill: string, i: number) => (
                                                    <span key={i} className="text-xs bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{skill}</span>
                                                ))}
                                                {notif.skills.length > 3 && <span className="text-xs text-muted-foreground">+{notif.skills.length - 3} more</span>}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="font-medium">{notif.message}</p>
                                )}
                                
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                            {(notif.relatedJobId || notif.type === 'job_post') && (
                                <Link href={`/jobs/${notif.relatedJobId || notif._id}`}>
                                    <button className="text-sm text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap">
                                        View Job
                                    </button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
      </main>
    </div>
  );
}
