"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Bell, Lock, Shield, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>({
    name: "",
    email: "",
    bio: "",
    preferences: { emailNotifications: true, publicProfile: false }
  });

  const [activeTab, setActiveTab] = useState('profile');

  // OTP & Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [otpStep, setOtpStep] = useState<'send' | 'verify'>('send');
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // ... (keep existing state and handlers)

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/user/settings");
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          bio: user.bio,
          emailNotifications: user.preferences.emailNotifications,
          publicProfile: user.preferences.publicProfile
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings saved successfully");
        setUser(data.user);
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      const phone = user.phone || "9999999999"; 
      
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone })
      });
      
      if (res.ok) {
        toast.success(`OTP sent to ${phone}`);
        setOtpStep('verify');
      } else {
        toast.error("Failed to send OTP");
      }
    } catch (error) {
      toast.error("Error sending OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtpAndChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setOtpLoading(true);
    try {
      const phone = user.phone || "9999999999";
      
      // Call the new secure endpoint directly
      // It handles OTP verification internally now, or we can keep double verification.
      // The plan said: "Verifies the OTP... Updates the User".
      // So we can just call this single endpoint.
      
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpStep('send');

    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Settings Nav */}
            <div className="space-y-2">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    <User size={18} /> Profile
                </button>
                <button 
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    <Bell size={18} /> Notifications
                </button>
                <button 
                    onClick={() => setActiveTab('security')}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'security' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    <Lock size={18} /> Security
                </button>
                <button 
                    onClick={() => setActiveTab('privacy')}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'privacy' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    <Shield size={18} /> Privacy
                </button>
            </div>

            {/* Settings Content */}
            <div className="md:col-span-3 space-y-6">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
                ) : (
                    <>
                    {activeTab === 'profile' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Full Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white" 
                                            value={user.name}
                                            onChange={(e) => setUser({...user, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Email</label>
                                        <input 
                                            type="email" 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white opacity-50 cursor-not-allowed" 
                                            value={user.email}
                                            disabled 
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium text-slate-400">Bio</label>
                                        <textarea 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white h-24" 
                                            value={user.bio}
                                            onChange={(e) => setUser({...user, bio: e.target.value})}
                                            placeholder="Tell us about yourself..." 
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <Button onClick={handleSaveProfile} disabled={saving}>
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                                    <div>
                                        <h4 className="font-medium">Password</h4>
                                        <p className="text-sm text-slate-400">Last changed 3 months ago</p>
                                    </div>
                                    <Button variant="outline" onClick={() => setShowPasswordModal(true)}>Change Password</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'notifications' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                                    <div>
                                        <h4 className="font-medium">Email Notifications</h4>
                                        <p className="text-sm text-slate-400">Receive emails about new job matches</p>
                                    </div>
                                    <div 
                                        className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${user.preferences?.emailNotifications ? 'bg-blue-600' : 'bg-slate-700'}`}
                                        onClick={() => {
                                            setUser({
                                                ...user, 
                                                preferences: { ...user.preferences, emailNotifications: !user.preferences.emailNotifications }
                                            });
                                            setTimeout(() => handleSaveProfile(), 0); 
                                        }}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.preferences?.emailNotifications ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'privacy' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Privacy</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                                    <div>
                                        <h4 className="font-medium">Public Profile</h4>
                                        <p className="text-sm text-slate-400">Allow others to see your profile</p>
                                    </div>
                                    <div 
                                        className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${user.preferences?.publicProfile ? 'bg-blue-600' : 'bg-slate-700'}`}
                                        onClick={() => {
                                            setUser({
                                                ...user, 
                                                preferences: { ...user.preferences, publicProfile: !user.preferences.publicProfile }
                                            });
                                            setTimeout(() => handleSaveProfile(), 0);
                                        }}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.preferences?.publicProfile ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    </>
                )}
            </div>
        </div>

        {/* Password Change OTP Modal */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                        {otpStep === 'send' 
                            ? "We need to verify your identity. Click below to send an OTP to your registered mobile number." 
                            : "Enter the OTP sent to your mobile number and your new password."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {otpStep === 'send' ? (
                        <div className="flex justify-center">
                            <Button onClick={handleSendOtp} disabled={otpLoading} className="w-full">
                                {otpLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Send OTP
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>One-Time Password</Label>
                                <Input 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)} 
                                    placeholder="Enter 6-digit OTP" 
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input 
                                    type="password"
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    placeholder="New Password" 
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input 
                                    type="password"
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    placeholder="Confirm New Password" 
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>
                            <Button onClick={handleVerifyOtpAndChangePassword} disabled={otpLoading} className="w-full bg-green-600 hover:bg-green-700">
                                {otpLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Verify & Change Password
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}
