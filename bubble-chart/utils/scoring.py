# utils/scoring.py
from math import log, sqrt

def clamp(x, lo=0, hi=100):
    return max(lo, min(hi, x))

# def freelancer_credibility_score(avg_days_to_pay: float, review_count: int, disputes: int = 0):
#     """
#     Produce a 0-100 credibility score for a freelancer.
#     Lower avg_days_to_pay => higher score. More reviews => slight boost.
#     disputes penalize.
#     """
#     base = 70.0
#     base -= avg_days_to_pay * 0.8        # each day late reduces score
#     base += min(15, log(max(1, review_count)) * 3.0)  # log boost from reviews
#     base -= disputes * 10
#     return int(clamp(round(base), 0, 100))

# def company_risk_score(overdue_ratio: float, avg_days_to_pay: float, dispute_ratio: float = 0.0):
#     """
#     Produce a 0-100 risk for companies. Higher means more risky (bad payer).
#     overdue_ratio: overdue invoices / total invoices (0..1)
#     """
#     score = overdue_ratio * 60 + (avg_days_to_pay / 30.0) * 30 + dispute_ratio * 50
#     return int(clamp(round(score), 0, 100))

# def edge_strength_from_history(num_projects: int, total_amount: float, last_active_days: float):
#     """
#     Derive an edge weight (higher is stronger).
#     - num_projects counts stronger ties
#     - total_amount contributes
#     - recency (last_active_days smaller => stronger)
#     """
#     w = 0.0
#     w += min(10, num_projects) * 2.0
#     w += min(1_000_000, total_amount) / 100000.0  # scale money
#     # recency: if last_active_days small -> boost
#     w += max(0, 5 - (last_active_days / 30.0))
#     return round(w, 3)


# utils/scoring.py (quick stubs)
def freelancer_credibility_score(avg_days, review_count, disputes=0):
    return max(0, min(100, int(100 - avg_days*0.5 + review_count*0.5 - disputes*10)))

def company_risk_score(overdue_ratio, avg_days_to_pay):
    return min(100, int(overdue_ratio*100 + avg_days_to_pay*0.2))

def edge_strength_from_history(num_projects, total_amount, last_active_days):
    return max(0.0, min(1.0, (num_projects / 10.0) + min(1.0, total_amount / 100000.0) - min(1.0, last_active_days/365.0)))
