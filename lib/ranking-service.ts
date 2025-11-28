import User from "@/models/User";

type Bid = {
    freelancerId: string;
    amount: number;
    proposal?: string;
    freelancerName?: string;
    [key: string]: any;
};

type Job = {
    skills: string[];
    budget_max?: number;
    budget_min?: number;
    [key: string]: any;
};

export async function rankBids(job: Job, bids: Bid[]) {
    if (!bids || bids.length === 0) return [];

    const freelancerIds = bids.map(b => b.freelancerId);
    const freelancers = await User.find({ userId: { $in: freelancerIds } }).lean();
    const freelancerMap = new Map(freelancers.map((f: any) => [f.userId, f]));

    const scoredBids = bids.map(bid => {
        const freelancer = freelancerMap.get(bid.freelancerId);
        if (!freelancer) return { ...bid, score: 0 };

        // 1. Skill Score (40%)
        // Assuming freelancer has skills in profile (mocking if not present as per previous steps)
        const freelancerSkills: string[] = (freelancer as any).skills || [];
        const jobSkills = job.skills || [];
        
        const matchingSkills = jobSkills.filter(s => 
            freelancerSkills.some(fs => fs.toLowerCase() === s.toLowerCase())
        );
        
        const skillScore = jobSkills.length > 0 
            ? (matchingSkills.length / jobSkills.length) * 100 
            : 0;

        // 2. Experience Score (30%)
        // Normalize: 5+ years = 100, 0 years = 0. Linear in between.
        const experienceYears = (freelancer as any).experience_years || 0;
        const experienceScore = Math.min(100, (experienceYears / 5) * 100);

        // 3. Price Score (30%)
        // Lower bid is better. 
        // If bid <= budget_min, score 100.
        // If bid >= budget_max, score 0 (or lower).
        // Let's use a ratio relative to budget_max.
        const budgetMax = job.budget_max || job.budget_min || bid.amount * 1.2; // Fallback
        let priceScore = 0;
        if (bid.amount <= budgetMax) {
            // simple linear formula: 100 * (1 - (bid / (budgetMax * 1.5))) ?
            // Or simpler: if bid is 50% of budget, score is high.
            // Let's use: Score = 100 * (budgetMax - bid) / budgetMax
            // But if bid is very low, it's good for client? Yes.
            // If bid > budgetMax, score should be low.
            
            // Let's use the prompt's suggestion: "Lower bid relative to budget gets higher points"
            // Let's say optimal is 80% of budget.
            // We'll just use a simple inverse ratio for now.
            // 100 points if bid is 0 (unrealistic), 0 points if bid is 2x budget.
            // Better: 100 * (budgetMax / bid) -> if bid is small, score explodes.
            // Let's stick to: 100 * (1 - (bid - min) / (max - min)) logic?
            
            // Let's try: 
            // If bid < budget_max: score = 100 * (1 - bid/budgetMax * 0.5) -> if bid=max, score=50. if bid=0, score=100.
            priceScore = Math.max(0, 100 * (1 - (bid.amount / (budgetMax * 1.5))));
        }

        const totalScore = (skillScore * 0.4) + (experienceScore * 0.3) + (priceScore * 0.3);

        return {
            ...bid,
            score: Math.round(totalScore),
            details: {
                skillScore: Math.round(skillScore),
                experienceScore: Math.round(experienceScore),
                priceScore: Math.round(priceScore)
            }
        };
    });

    // Sort by score descending
    return scoredBids.sort((a, b) => b.score - a.score);
}
