// lib/agents/cfo.ts
import { callGemini } from "./ai-client";

export type Transaction = {
    transaction_id: string;
    user_id: string;
    amount: number;
    type: string; // CREDIT / DEBIT
    narration?: string;
    date?: string;
    balance_after_transaction?: number;
    related_invoice_id?: string;
};

export type SmartSplitConfig = {
    tax_pct: number;
    savings_pct: number;
    buffer_pct: number;
};

export const DEFAULT_SPLIT: SmartSplitConfig = { tax_pct: 30, savings_pct: 20, buffer_pct: 50 };

/**
 * Trigger helper: decide whether CFO agent should act.
 * - Act on incoming credits (payments).
 * - Act on low-balance alerts (if balance provided and below threshold).
 */
export function shouldActOnTransaction(txn: Transaction, profile: { balances?: { checking?: number } } = { balances: {} }) {
    if (!txn) return false;
    const t = (txn.type || "").toUpperCase();
    // Always act on CREDIT transactions (incoming payments)
    if (t === "CREDIT" && txn.amount > 0) return true;
    // If DEBIT and balance falls below threshold, act
    if (t === "DEBIT" && typeof txn.balance_after_transaction === "number") {
        const lowBalanceThreshold = (profile.balances?.checking ?? 0) * 0.15; // 15% of configured checking balance
        if (txn.balance_after_transaction < lowBalanceThreshold) return true;
    }
    return false;
}

/**
 * Main handler: onTransaction - suggests smart split for incoming payments,
 * basic alerts on low balance, and returns an actionable payload (do not auto-execute).
 */
export async function onTransaction(
    txn: Transaction,
    profile: { user_id: string; monthly_burn?: number; balances?: any; smart_split_config?: SmartSplitConfig } = { user_id: "" }
) {
    if (!txn) return null;
    const txType = (txn.type || "").toUpperCase();

    // Low-balance alert for DEBIT
    if (txType === "DEBIT" && typeof txn.balance_after_transaction === "number") {
        const lowBalanceThreshold = (profile.balances?.checking ?? 0) * 0.15;
        if (txn.balance_after_transaction < lowBalanceThreshold) {
            const prompt = `Shortly notify user: account balance low. Balance after transaction: ₹${txn.balance_after_transaction}. Suggest 3 quick actions: (1) pause non-essential services (2) request early payments (3) move buffer from savings. Output 3 bullets.`;
            const gm = await callGemini(prompt, 120);
            return {
                type: "low_balance_alert",
                txn_id: txn.transaction_id,
                balance: txn.balance_after_transaction,
                message: gm.text || `Low balance: ₹${txn.balance_after_transaction}.`,
                suggested_actions: ["Pause services", "Request early payments", "Move buffer"]
            };
        }
        return null;
    }

    // SmartSplit for CREDITs
    if (txType === "CREDIT" && txn.amount > 0) {
        const cfg: SmartSplitConfig = profile["smart_split_config"] || DEFAULT_SPLIT;

        const tax_amount = Math.round((cfg.tax_pct / 100) * txn.amount);
        const savings_amount = Math.round((cfg.savings_pct / 100) * txn.amount);
        const buffer_amount = Math.round(txn.amount - tax_amount - savings_amount);

        const actions = [
            { action: "transfer", to: "tax_savings", amount: tax_amount, reason: "smart_split_tax" },
            { action: "transfer", to: "savings", amount: savings_amount, reason: "smart_split_savings" },
            { action: "leave_checking", amount: buffer_amount, reason: "spendable_buffer" }
        ];

        const prompt = `Summarize the following split to the user in two short sentences: Incoming payment ₹${txn.amount}. We suggest: Tax ₹${tax_amount}, Savings ₹${savings_amount}, Checking ₹${buffer_amount}. Also include one short actionable sentence: "Approve transfers" or "Adjust split".`;
        const gm = await callGemini(prompt, 120);

        return {
            type: "smart_split",
            txn_id: txn.transaction_id,
            suggested_actions: actions,
            message: gm.text || `Split: Tax ${tax_amount}, Savings ${savings_amount}, Checking ${buffer_amount}`,
            meta: {
                tax_pct: cfg.tax_pct,
                savings_pct: cfg.savings_pct,
                buffer_pct: cfg.buffer_pct
            }
        };
    }

    return null;
}
