// lib/agents/productivity.ts
import { callGemini } from "./ai-client";

export type UserSchedule = {
    user_id: string;
    tasks: { id: string; dueDate?: string; est_hours?: number; priority?: string; done?: boolean }[];
    calendarEvents: { id: string; start: string; end: string; title?: string }[];
    capacity: { billableDaysPerYear?: number; billableHoursPerDay?: number };
};

export type ProductivityAction =
    | { type: "block_new_jobs"; reason: string }
    | { type: "create_deep_work_block"; start: string; end: string; title: string }
    | { type: "reschedule_task"; taskId: string; newDate: string }
    | { type: "suggest_reprioritize"; suggestions: { taskId: string; suggestedPriority: string }[]; message?: string };

const UTILIZATION_THRESHOLD = 0.75; // 75%

/**
 * Trigger helper: when to evaluate schedule?
 * - New task created
 * - Task deadline approaching (<48h)
 * - Calendar changed
 * - User attempts to accept a job
 * The caller can decide which event occurred; this helper provides a quick boolean
 */
export function shouldEvaluateSchedule(eventType: "task_created" | "deadline_approaching" | "calendar_updated" | "job_accept_attempt", schedule?: UserSchedule) {
    if (!schedule) return true;
    if (eventType === "job_accept_attempt") return true;
    if (eventType === "deadline_approaching") return true;
    if (eventType === "task_created" || eventType === "calendar_updated") return true;
    return false;
}

/**
 * Main: evaluateSchedule returns utilization + actions to perform (UI shows them).
 */
export async function evaluateSchedule(schedule: UserSchedule) {
    const upcomingTasks = (schedule.tasks || []).filter(t => !t.done);
    const next7DaysHours = upcomingTasks.reduce((acc, t) => acc + (t.est_hours || 1), 0);
    const weeklyCapacity =
        (schedule.capacity?.billableDaysPerYear ? schedule.capacity.billableDaysPerYear / 52 : 5) * (schedule.capacity?.billableHoursPerDay ?? 6);

    const utilization = next7DaysHours / Math.max(1, weeklyCapacity);
    const actions: ProductivityAction[] = [];

    if (utilization >= UTILIZATION_THRESHOLD) {
        actions.push({ type: "block_new_jobs", reason: `High utilization ${Math.round(utilization * 100)}%` });
    }

    // Deep-work block: attempt to create a 2-hour block tomorrow at 09:00 unless conflict
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultStart = new Date(tomorrow.setHours(9, 0, 0, 0)).toISOString();
    const defaultEnd = new Date(new Date(defaultStart).getTime() + 2 * 3600 * 1000).toISOString();

    const overlapping = (schedule.calendarEvents || []).some(e => {
        const s = new Date(e.start), en = new Date(e.end);
        return new Date(defaultStart) < en && new Date(defaultEnd) > s;
    });

    if (!overlapping) {
        actions.push({ type: "create_deep_work_block", start: defaultStart, end: defaultEnd, title: "Deep Work - Focus Block" });
    }

    // Use Gemini to propose reprioritization (structured JSON)
    const prompt = `You are a productivity assistant. Given tasks (id, est_hours, dueDate), propose three tasks to mark HIGH priority to avoid missed deadlines. Return JSON array: [{"taskId":"..","suggestedPriority":"High"}] .
Tasks: ${JSON.stringify(upcomingTasks.slice(0, 20))}`;

    const gm = await callGemini(prompt, 200);
    let suggestions: { taskId: string; suggestedPriority: string }[] = [];
    try {
        const parsed = JSON.parse(gm.text || "[]");
        if (Array.isArray(parsed)) suggestions = parsed.slice(0, 10);
    } catch (e) {
        // fallback: pick earliest due dates
        suggestions = upcomingTasks
            .sort((a, b) => (new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime()))
            .slice(0, 3)
            .map(t => ({ taskId: t.id, suggestedPriority: "High" }));
    }

    actions.push({ type: "suggest_reprioritize", suggestions, message: "Auto-prioritized by Productivity Agent." });

    return { utilization, actions };
}
