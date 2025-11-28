// lib/agents/tax.ts
import { callGemini } from "./ai-client";

export type Txn = {
    transaction_id: string;
    user_id: string;
    amount: number;
    narration?: string;
    date?: string;
    category?: string;
};

export type Categorization = { transaction_id: string; category: string; deductible: boolean; notes?: string };

const RULES = [
    { pattern: /fuel|petrol|diesel|petrol pump/i, category: "Transport", deductible: false },
    { pattern: /amazon|flipkart|myntra|croma/i, category: "Supplies", deductible: false },
    { pattern: /office|software|github|figma|adobe|paypal|google cloud|aws|azure/i, category: "Software/Tools", deductible: true },
    { pattern: /electricity|internet|broadband|wifi/i, category: "Utilities", deductible: true }
];

/**
 * Trigger helper: shouldTaxAgentAct
 * - act when a new debit/expense txn is ingested OR at month-end batch
 */
export function shouldTaxAgentAct(txn: Txn, eventType: "txn_ingested" | "month_end" = "txn_ingested") {
    if (!txn) return false;
    if (eventType === "txn_ingested") {
        // consider only DEBIT-like narrations (caller decides) — but we'll act conservatively for positive amounts
        return txn.amount > 0;
    }
    return true; // for month_end run
}

/**
 * categorizeTransaction: returns category & deductible flag using rules then LLM fallback
 */
export async function categorizeTransaction(txn: Txn): Promise<Categorization> {
    const narr = txn.narration || "";

    for (const r of RULES) {
        if (r.pattern.test(narr)) {
            return { transaction_id: txn.transaction_id, category: r.category, deductible: r.deductible, notes: "rule-match" };
        }
    }

    const prompt = `
Classify this expense into one of: "Office/Software", "Travel", "Meals", "Supplies", "Utilities", "Medical", "Other".
Also say whether it is typically tax-deductible for a freelance sole proprietor in India (yes/no) with a one-line reason.
Return JSON: {"category":"...","deductible":true,"reason":"..."}.
NARRATION: "${narr.replace(/\n/g, " ")}"
AMOUNT: ${txn.amount}
  `.trim();

    const gm = await callGemini(prompt, 180);

    try {
        const parsed = JSON.parse(gm.text || "{}");
        return {
            transaction_id: txn.transaction_id,
            category: parsed.category || "Other",
            deductible: !!parsed.deductible,
            notes: parsed.reason || "LLM"
        };
    } catch (e) {
        return { transaction_id: txn.transaction_id, category: "Other", deductible: false, notes: "fallback" };
    }
}

/**
 * summarizeMonthly: quick monthly deductible summary (simple heuristic + txn narration pattern)
 */
export function summarizeMonthly(txs: Txn[]) {
    const monthMap: Record<string, { deductible_total: number; total: number; counts: number }> = {};
    for (const t of txs) {
        const m = (new Date(t.date || Date.now())).toISOString().slice(0, 7);
        monthMap[m] = monthMap[m] || { deductible_total: 0, total: 0, counts: 0 };
        const isDeduct = /software|office|utilities|aws|figma|adobe|github/i.test(t.narration || "");
        monthMap[m].counts += 1;
        monthMap[m].total += t.amount;
        if (isDeduct) monthMap[m].deductible_total += t.amount;
    }
    return monthMap;
}
