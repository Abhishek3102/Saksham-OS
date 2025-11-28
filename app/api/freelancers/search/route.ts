import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const category = searchParams.get("category");
        const minExp = searchParams.get("minExp");
        const maxExp = searchParams.get("maxExp");
        const skills = searchParams.get("skills");

        console.log("Search Params:", { id, category, minExp, maxExp, skills });

        const csvPath = path.join(process.cwd(), "bubble-chart", "data", "freelancers_profile.csv");
        const csvFile = fs.readFileSync(csvPath, "utf8");

        const { data } = Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
        });

        let freelancers = data as any[];

        // Filter by ID or Name
        if (id) {
            freelancers = freelancers.filter((f) =>
                f.freelancer_id.toLowerCase().includes(id.toLowerCase()) ||
                f.name.toLowerCase().includes(id.toLowerCase())
            );
        }

        // Filter by Category
        if (category) {
            freelancers = freelancers.filter((f) =>
                (f.skills && f.skills.toLowerCase().includes(category.toLowerCase())) ||
                (f.primary_domain && f.primary_domain.toLowerCase().includes(category.toLowerCase()))
            );
        }

        // Filter by Experience Range
        if (minExp) {
            freelancers = freelancers.filter((f) => {
                const exp = parseFloat(f.experience_years);
                return !isNaN(exp) && exp >= parseFloat(minExp);
            });
        }

        if (maxExp) {
            freelancers = freelancers.filter((f) => {
                const exp = parseFloat(f.experience_years);
                return !isNaN(exp) && exp <= parseFloat(maxExp);
            });
        }

        // Filter by Skills (comma separated)
        if (skills) {
            const skillList = skills.split(",").map((s: string) => s.trim().toLowerCase());
            freelancers = freelancers.filter((f) => {
                if (!f.skills) return false;
                const fSkills = f.skills.toLowerCase();
                return skillList.some((s: string) => fSkills.includes(s));
            });
        }

        // Limit results for performance
        const results = freelancers.slice(0, 50).map(f => ({
            id: f.freelancer_id,
            name: f.name,
            skills: f.skills ? f.skills.split(',').map((s: string) => s.trim()) : [],
            experience: f.experience_years,
            rating: f.credibility_score,
            completed_jobs: f.past_projects_count,
            hourly_rate: f.avg_earning_per_project ? (parseFloat(f.avg_earning_per_project) / 20).toFixed(0) : "50", // Rough estimate
            location: "Remote",
            avatar: f.name.charAt(0)
        }));

        return NextResponse.json(results);

    } catch (error) {
        console.error("Error searching freelancers:", error);
        return NextResponse.json({ error: "Failed to fetch freelancers" }, { status: 500 });
    }
}
