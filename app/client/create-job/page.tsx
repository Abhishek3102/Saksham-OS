"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Briefcase, Calendar, DollarSign, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

import { PaymentModal } from "@/components/features/PaymentModal";

export default function CreateJobPage() {
  const [formData, setFormData] = useState({
    title: "",
    job_category: "Web Development",
    budget_min: "",
    budget_max: "",
    currency: "INR",
    urgency_level: "Medium",
    experience_level: "Mid",
    job_description: "",
    skills: "",
    required_hours_estimate: "",
    deadline: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form if needed
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentResponse: any) => {
    setIsSubmitting(true);

    // Construct the JSON object as per schema
    const jobPayload = {
      ...formData,
      skills: formData.skills.split(",").map(s => s.trim()), // Convert comma-separated string to array
      budget_min: Number(formData.budget_min),
      budget_max: Number(formData.budget_max),
      required_hours_estimate: Number(formData.required_hours_estimate),
      job_status: "Open",
      payment_id: paymentResponse.razorpay_payment_id, // Store payment ID
    };

    try {
        const res = await fetch("/api/jobs/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jobPayload),
        });

        if (!res.ok) {
            throw new Error("Failed to post job");
        }

        setSubmitSuccess(true);
        // Reset form after delay
        setTimeout(() => {
             setSubmitSuccess(false);
             setFormData({
                title: "",
                job_category: "Web Development",
                budget_min: "",
                budget_max: "",
                currency: "INR",
                urgency_level: "Medium",
                experience_level: "Mid",
                job_description: "",
                skills: "",
                required_hours_estimate: "",
                deadline: "",
             });
        }, 2000);

    } catch (error) {
        console.error(error);
        // Handle error state if needed
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Post a New Job</h1>
          <p className="text-muted-foreground">Create a detailed job posting to attract the best freelancers.</p>
        </header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="max-w-4xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <CardTitle>Job Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="e.g. Full Stack Developer for Fintech App" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                {/* Category & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="job_category">Category</Label>
                    <select 
                      id="job_category" 
                      name="job_category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.job_category}
                      onChange={handleChange}
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile">Mobile App</option>
                      <option value="Design">UI/UX Design</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Blockchain">Blockchain</option>
                      <option value="AI/ML">AI / ML</option>
                      <option value="Content/Marketing">Content & Marketing</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_level">Experience Level</Label>
                    <select 
                      id="experience_level" 
                      name="experience_level"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.experience_level}
                      onChange={handleChange}
                    >
                      <option value="Junior">Junior</option>
                      <option value="Mid">Mid-Level</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>
                </div>

                {/* Budget & Currency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget_min">Min Budget</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="budget_min" 
                        name="budget_min" 
                        type="number" 
                        className="pl-9" 
                        placeholder="10000" 
                        value={formData.budget_min} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget_max">Max Budget</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="budget_max" 
                        name="budget_max" 
                        type="number" 
                        className="pl-9" 
                        placeholder="50000" 
                        value={formData.budget_max} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select 
                      id="currency" 
                      name="currency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.currency}
                      onChange={handleChange}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                {/* Urgency & Hours */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="urgency_level">Urgency</Label>
                    <select 
                      id="urgency_level" 
                      name="urgency_level"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.urgency_level}
                      onChange={handleChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="required_hours_estimate">Est. Hours</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="required_hours_estimate" 
                        name="required_hours_estimate" 
                        type="number" 
                        className="pl-9" 
                        placeholder="40" 
                        value={formData.required_hours_estimate} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="deadline" 
                        name="deadline" 
                        type="date" 
                        className="pl-9" 
                        value={formData.deadline} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Description & Skills */}
                <div className="space-y-2">
                  <Label htmlFor="job_description">Description</Label>
                  <textarea 
                    id="job_description"
                    name="job_description"
                    className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe the project requirements, responsibilities, and deliverables..."
                    value={formData.job_description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills (comma separated)</Label>
                  <Input 
                    id="skills" 
                    name="skills" 
                    placeholder="React, Node.js, TypeScript, Tailwind CSS" 
                    value={formData.skills} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || submitSuccess}>
                    {isSubmitting ? "Posting Job..." : submitSuccess ? "Job Posted Successfully!" : "Post Job & Pay"}
                  </Button>
                </div>

                {submitSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 text-green-500 font-medium bg-green-500/10 p-4 rounded-md"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Job posted successfully! It is now visible to freelancers.</span>
                  </motion.div>
                )}

              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Modal */}
        <PaymentModal 
            isOpen={showPaymentModal}
            onOpenChange={setShowPaymentModal}
            amount={199} // Fixed fee for job posting, or dynamic based on budget
            onSuccess={handlePaymentSuccess}
            onFailure={(err) => console.error("Payment failed", err)}
        />

      </main>
    </div>
  );
}
