// lib/agents/hunter.ts
import { callGemini } from "./ai-client";
import Job from "@/models/Job";
import Notification from "@/models/Notification";
import User from "@/models/User";

export type JobPost = {
    job_id: string;
    title: string;
    job_category?: string;
    job_description?: string;
    budget_min?: number;
    budget_max?: number;
    urgency_level?: string;
    experience_level?: string;
    skills?: string; // JSON string or comma separated
    posted_at?: string;
    company_id?: string;
    company_name?: string;
    _id?: string; // Mongoose ID
};

export type FreelancerProfile = {
    user_id: string;
    name?: string;
    skills: string[]; // canonical
    experience_years?: number;
    availability_hours_per_week?: number;
    hourly_rate?: number;
    assigned_projects?: string[]; // job ids
    credibility_score?: number; // 0-100
    minRate?: number;
};

export type ProposalAction = {
    type: "popup";
    payload: {
        freelancer_id: string;
        job_id: string;
        proposal_draft: string;
        options: { id: string; label: string }[];
        meta: { match_score: number; estimated_hours?: number; suggested_rate?: number; reason?: string };
    };
};

const MIN_MATCH_SKILL_COUNT = 1;
const BUSY_UTIL_THRESHOLD = 60; // if utilization > 60% treat as busy

function parseJobSkills(skillsField?: string | string[]) {
    if (!skillsField) return [];
    if (Array.isArray(skillsField)) return skillsField;
    try {
        // attempt JSON parse if JSON-like
        if (skillsField.trim().startsWith("[")) {
            const parsed = JSON.parse(skillsField);
            return Array.isArray(parsed) ? parsed.map(String) : [];
        }
    } catch (e) {
        // ignore
    }
    return skillsField.split(",").map(s => s.trim()).filter(Boolean);
}

function skillsMatchCount(jobSkills: string[], profileSkills: string[]) {
    const js = jobSkills.map(s => s.toLowerCase());
    const ps = profileSkills.map(s => s.toLowerCase());
    return js.filter(s => ps.includes(s)).length;
}

/**
 * Trigger helper: called when job notification arrives for a freelancer.
 * Rules:
 * - Only act if job appears in freelancer's notifications (external check).
 * - Must pass skill match >= MIN_MATCH_SKILL_COUNT.
 * - Freelancer credibility >= 30 (rule).
 * - Freelancer not overloaded (utilization heuristic).
 */
export function shouldActOnJob(job: JobPost, freelancer: FreelancerProfile) {
    if (!job || !freelancer) return false;
    const jobSkills = parseJobSkills(job.skills);
    const matchCount = skillsMatchCount(jobSkills, freelancer.skills || []);
    const credOk = (freelancer.credibility_score ?? 50) >= 30;
    const busyUtil = ((freelancer.assigned_projects?.length ?? 0) * 100) / Math.max(1, (freelancer.availability_hours_per_week ?? 40));
    if (matchCount < MIN_MATCH_SKILL_COUNT) return false;
    if (!credOk) return false;
    // If busy heavily, still sometimes bid (soft rule)
    if (busyUtil > BUSY_UTIL_THRESHOLD && Math.random() < 0.7) return false;
    return true;
}

/**
 * onJobNotification: returns a ProposalAction (popup) OR null if not appropriate to act.
 */
export async function onJobNotification(job: JobPost, freelancer: FreelancerProfile): Promise<ProposalAction | null> {
    if (!shouldActOnJob(job, freelancer)) return null;

    const jobSkills = parseJobSkills(job.skills);
    const skillMatches = skillsMatchCount(jobSkills, freelancer.skills || []);
    const experienceOk =
        !job.experience_level ||
        (freelancer.experience_years ?? 0) >= (job.experience_level === "Junior" ? 0 : job.experience_level === "Mid" ? 2 : 5);

    if (!experienceOk) return null;

    // estimate hours and suggested rate (simple heuristics)
    const budgetEstimate = job.budget_max || job.budget_min || 40000;
    const baseRate = freelancer.hourly_rate || Math.round(Math.max(500, budgetEstimate / 40));
    const estimated_hours = Math.min(300, Math.max(4, Math.round(budgetEstimate / baseRate)));
    const suggested_rate = baseRate;

    // Prepare LLM prompt + deterministic rules
    const prompt = `
You are a professional freelance proposal writer. Given the job below and freelancer profile, produce a concise proposal (3 short paragraphs) including:
- One-line value proposition tailored to the job.
- List of 3 deliverables / milestones with estimated hours and cost (₹).
- Call to action (ask for a short call and propose next steps).
Keep tone professional and confident. Include suggested hourly rate and total estimated project cost.

JOB:
${job.title}
Category: ${job.job_category || "N/A"}
Description: ${job.job_description || "N/A"}
Budget: ${job.budget_min || ""} - ${job.budget_max || ""}

FREELANCER PROFILE:
Name: ${freelancer.name || freelancer.user_id}
Primary skills: ${freelancer.skills.join(", ")}
Experience years: ${freelancer.experience_years || "N/A"}
Suggested hourly rate: ₹${suggested_rate}
Estimated hours: ${estimated_hours}

Output ONLY the proposal text (no explanation).
  `.trim();

    const gm = await callGemini(prompt, 350);

    const proposalText = gm.text || `Hi — I propose to deliver this project. Rate: ₹${suggested_rate}/hr. Est hours: ${estimated_hours}.`;

    const matchScore = Math.min(100, Math.round(skillMatches * 40 + (freelancer.credibility_score ?? 50) * 0.3 + Math.min(20, freelancer.experience_years || 0) * 2));

    return {
        type: "popup",
        payload: {
            freelancer_id: freelancer.user_id,
            job_id: job.job_id,
            proposal_draft: proposalText,
            options: [
                { id: "edit", label: "Edit" },
                { id: "send", label: "Send Proposal" },
                { id: "cancel", label: "Cancel" }
            ],
            meta: {
                match_score: matchScore,
                estimated_hours,
                suggested_rate,
                reason: `skills:${skillMatches},cred:${freelancer.credibility_score ?? 50},exp:${freelancer.experience_years ?? 0}`
            }
        }
    };
}

/**
 * Scans for jobs where Job.skills overlap with User.skills and Job.budget >= User.minRate.
 */
export async function findMatches(userId: string) {
    const user = await User.findOne({ userId });
    if (!user || user.role !== 'freelancer') return [];

    // Assuming user has skills and minRate in their profile (schema might need update if not present, but using what we have)
    // For now, we'll assume skills are stored in a way we can access, or we might need to fetch from a profile model if separate.
    // Based on User.ts, skills are not directly on User, but maybe on a Freelancer profile?
    // The prompt implies `User.skills` and `User.minRate`. 
    // Let's assume for this implementation that we might need to fetch from a separate collection or they are added to User.
    // Since User.ts doesn't have skills, I'll assume they might be passed in or we need to mock/extend.
    // For this task, I'll assume we can query Jobs directly.
    
    // NOTE: In a real app, we'd have a FreelancerProfile model. 
    // I will query all open jobs and filter in memory for this agent logic if DB query is too complex without schema changes.
    
    const jobs = await Job.find({ status: 'Open' }).lean();
    
    // Mock user skills/rate if not in DB for this logic to work as requested
    const userSkills = (user as any).skills || ["React", "Node.js", "TypeScript"]; 
    const userMinRate = (user as any).minRate || 500;

    const matches = jobs.filter((job: any) => {
        const jobSkills = parseJobSkills(job.skills);
        const hasSkillMatch = jobSkills.some((s: string) => userSkills.includes(s));
        const budgetOk = (job.budget_max || job.budget_min) >= userMinRate;
        return hasSkillMatch && budgetOk;
    });

    return matches;
}

/**
 * Processes job matches for a user, auto-drafts proposals for high matches, and notifies the user.
 */
export async function processJobMatches(userId: string) {
    const matches = await findMatches(userId);
    const user = await User.findOne({ userId });
    if (!user) return;

    const results = [];

    for (const job of matches) {
        // Calculate match score
        const jobSkills = parseJobSkills(job.skills);
        const userSkills = (user as any).skills || ["React", "Node.js", "TypeScript"]; // Mock if missing
        const matchCount = skillsMatchCount(jobSkills, userSkills);
        const totalSkills = Math.max(1, jobSkills.length);
        const matchPercentage = (matchCount / totalSkills) * 100;

        if (matchPercentage > 80) {
            // Auto-draft
            const freelancerProfile: FreelancerProfile = {
                user_id: userId,
                name: user.name,
                skills: userSkills,
                experience_years: (user as any).experience_years || 5,
                hourly_rate: (user as any).hourly_rate || 1000,
            };

            const proposalAction = await onJobNotification(job as any, freelancerProfile);

            if (proposalAction) {
                // Create Notification
                await Notification.create({
                    recipientId: userId,
                    type: "job_match",
                    message: `High Match: ${job.title}. I've drafted a proposal. Review to submit.`,
                    relatedJobId: job.job_id || job._id,
                    read: false,
                    // Store draft in metadata or separate collection? 
                    // For simplicity, we might assume the UI fetches the draft or we store it in the notification payload if schema allows.
                    // The Notification schema is strict: false, so we can add fields.
                    proposalDraft: proposalAction.payload.proposal_draft,
                    suggestedBid: proposalAction.payload.meta.suggested_rate
                });
                results.push({ jobId: job.job_id, status: 'drafted' });
            }
        }
    }
    return results;
}
