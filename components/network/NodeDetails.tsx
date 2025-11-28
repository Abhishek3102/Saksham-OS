"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { X, ExternalLink, MessageSquare, Star, Briefcase, DollarSign, TrendingUp, ShieldAlert, Clock, Award, Users } from "lucide-react";

interface NodeDetailsProps {
  node: any;
  onClose: () => void;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onClose }) => {
  if (!node) return null;

  const isFreelancer = node.type === "freelancer";
  
  // Helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // Calculations based on node type
  let metrics = [];
  let metaData = node.meta;
  
  // If meta is an array (Company), we might need to aggregate or pick the first one
  // The API response shows meta as an array for companies, but object for freelancers?
  // Let's handle both.
  if (Array.isArray(metaData)) {
      // Aggregate or just take the first one for now as they seem to be per-client views
      // Ideally we'd sum them up or show a specific one. Let's pick the first for simplicity
      // or if we want "Total", we use the root node props.
      metaData = metaData[0] || {};
  }

  if (isFreelancer) {
      metrics = [
          { label: "Total Earnings", value: formatCurrency(node.total_revenue || 0), icon: DollarSign, color: "text-green-400" },
          { label: "Projects", value: node.projects_count || 0, icon: Briefcase, color: "text-blue-400" },
          { label: "Credibility", value: `${node.credibility_score || 0}%`, icon: Star, color: "text-yellow-400" },
          { label: "Avg Days to Pay", value: Math.round(node.avg_days_to_pay || 0) + " days", icon: Clock, color: "text-slate-400" },
          { label: "Experience", value: `${metaData.experience_years || 0} Years`, icon: Award, color: "text-purple-400" },
          { label: "Avg/Project", value: formatCurrency(metaData.avg_earning_per_project || 0), icon: TrendingUp, color: "text-cyan-400" },
      ];
  } else {
      // Company
      // Calculate Avg Spend per Freelancer
      const totalHired = metaData.total_freelancers_hired || 1;
      const avgPerFreelancer = (node.total_revenue || 0) / totalHired;
      // Deduce budget from total revenue or similar
      const budget = node.total_revenue || 0; 

      metrics = [
          { label: "Total Spend", value: formatCurrency(budget), icon: DollarSign, color: "text-green-400" },
          { label: "Jobs Posted", value: node.jobs_posted || 0, icon: Briefcase, color: "text-blue-400" },
          { label: "Risk Score", value: node.risk_score || 0, icon: ShieldAlert, color: node.risk_score > 70 ? "text-red-400" : "text-green-400" },
          { label: "Avg/Project", value: formatCurrency(metaData.avg_money_spent_per_project || 0), icon: TrendingUp, color: "text-cyan-400" },
          { label: "Freelancers", value: totalHired, icon: Users, color: "text-purple-400" }, // Changed icon to Users
          { label: "Avg/Freelancer", value: formatCurrency(avgPerFreelancer), icon: DollarSign, color: "text-orange-400" },
      ];
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute top-0 right-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl p-6 overflow-y-auto z-40"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>

      <div className="mt-8">
        <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold shadow-lg ${
            isFreelancer ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white" : "bg-gradient-to-br from-purple-500 to-violet-600 text-white"
        }`}>
            {node.name.charAt(0)}
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-1">{node.name}</h2>
        <p className="text-center text-slate-400 text-sm uppercase tracking-wider mb-6">
          {isFreelancer ? metaData.primary_category || "Freelancer" : metaData.industry || "Company"}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
            {metrics.map((m, idx) => (
                <div key={idx} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <m.icon size={14} />
                        {m.label}
                    </div>
                    <div className={`text-lg font-mono font-semibold ${m.color}`}>
                        {m.value}
                    </div>
                </div>
            ))}
        </div>

        {/* Additional Details */}
        <div className="space-y-6">
            {isFreelancer && metaData.skills && (
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Top Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {metaData.skills.split(',').map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md border border-slate-700">
                                {skill.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            
            {isFreelancer && metaData.review_sample && (
                 <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 italic text-slate-400 text-sm">
                    "{metaData.review_sample}"
                 </div>
            )}

            {!isFreelancer && metaData.past_job_ids && (
                <div>
                     <h3 className="text-sm font-semibold text-slate-300 mb-2">Recent Activity</h3>
                     <p className="text-xs text-slate-500">
                        Posted {metaData.past_job_ids.split(',').length} jobs recently including {metaData.past_job_ids.split(',')[0]}...
                     </p>
                </div>
            )}

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <button className="w-full py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10">
                <MessageSquare size={18} />
                Message
            </button>
            <Link href={`/profile/${node.id}`} className="w-full block">
                <button className="w-full py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-700">
                    <ExternalLink size={18} />
                    View Full Profile
                </button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NodeDetails;
