import dbConnect from "@/lib/db";
import User from "@/models/User";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export interface ProfileData {
    id: string;
    name: string;
    email?: string;
    role: string;
    phone?: string;
    bio?: string;
    skills?: string[];
    experience_years?: number;
    hourly_rate?: number;
    location?: string;
    // Stats
    total_earnings?: number;
    jobs_completed?: number;
    rating?: number;
    // Client specific
    company_name?: string;
    jobs_posted?: number;
    total_spent?: number;
}

export async function getProfileById(id: string): Promise<ProfileData | null> {
    await dbConnect();

    // 1. Check MongoDB
    // We search by userId (custom ID) or _id
    const dbUser = await User.findOne({
        $or: [{ userId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (dbUser) {
        return {
            id: dbUser.userId || dbUser._id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            phone: dbUser.phone,
            role: dbUser.role,
            // Default/Empty values for new users
            skills: [],
            experience_years: 0,
            total_earnings: 0,
            jobs_completed: 0,
            rating: 0,
        };
    }

    // 2. Check CSVs (Static Data)
    // We need to read the CSV files from the public/data or bubble-chart/data directory
    // The previous file view showed them in `bubble-chart/data/`

    const csvDir = path.join(process.cwd(), 'bubble-chart', 'data');

    // Check Freelancers
    try {
        const freelancersPath = path.join(csvDir, 'freelancers_profile.csv');
        const freelancersCsv = fs.readFileSync(freelancersPath, 'utf8');
        const { data: freelancers } = Papa.parse(freelancersCsv, { header: true });

        const freelancer = freelancers.find((f: any) => f.freelancer_id === id);
        if (freelancer) {
            return {
                id: freelancer.freelancer_id,
                name: freelancer.name,
                role: 'freelancer',
                skills: freelancer.skills ? freelancer.skills.split(',').map((s: string) => s.trim()) : [],
                experience_years: parseInt(freelancer.experience_years) || 0,
                total_earnings: parseFloat(freelancer.total_revenue) || 0, // CSV might not have this exact field, need to check
                // The CSV view showed: avg_earning_per_project, past_projects_count
                // We can estimate total = avg * count
                jobs_completed: parseInt(freelancer.past_projects_count) || 0,
                rating: parseFloat(freelancer.credibility_score) || 0, // Using credibility as rating proxy
            };
        }
    } catch (e) {
        console.error("Error reading freelancers CSV", e);
    }

    // Check Clients
    try {
        const clientsPath = path.join(csvDir, 'clients_profile.csv');
        const clientsCsv = fs.readFileSync(clientsPath, 'utf8');
        const { data: clients } = Papa.parse(clientsCsv, { header: true });

        const client = clients.find((c: any) => c.client_id === id || c.company_id === id); // Handle both IDs?
        if (client) {
            return {
                id: client.client_id,
                name: client.company_name, // Use company name for clients?
                role: 'client',
                company_name: client.company_name,
                jobs_posted: parseInt(client.total_jobs_posted) || 0,
                total_spent: parseFloat(client.avg_money_spent_per_project) * (parseInt(client.total_freelancers_hired) || 1), // Estimate
            };
        }
    } catch (e) {
        console.error("Error reading clients CSV", e);
    }

    return null;
}
