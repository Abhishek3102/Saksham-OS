import { NextResponse } from "next/server";
import { extractTextFromBuffer, extractSkills, analyzeExperience, analyzeEducation, suggestRoleMatch, JOB_ROLES } from "@/lib/resume-analyzer";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File;
        const roleSelection = formData.get("role_selection") as string;

        if (!file) {
            return NextResponse.json({ error: "Resume file is required" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const text = await extractTextFromBuffer(buffer, file.type);

        const extractedSkills = extractSkills(text);
        const experienceFound = analyzeExperience(text);
        const educationFound = analyzeEducation(text);
        const roleMatches = suggestRoleMatch(extractedSkills);

        const matchScore = roleMatches[roleSelection] || 0;
        const totalSkills = Object.values(extractedSkills).flat().length;

        const allFoundSkills = new Set(Object.values(extractedSkills).flat());

        const missingRequired = roleSelection && JOB_ROLES[roleSelection]
            ? JOB_ROLES[roleSelection].required_skills.filter(s => !allFoundSkills.has(s))
            : [];

        const missingGoodToHave = roleSelection && JOB_ROLES[roleSelection]
            ? JOB_ROLES[roleSelection].good_to_have.filter(s => !allFoundSkills.has(s))
            : [];

        return NextResponse.json({
            role_match_score: matchScore,
            skills_found: extractedSkills,
            experience_found: experienceFound,
            education_found: educationFound,
            missing_required_skills: missingRequired,
            missing_good_to_have: missingGoodToHave,
            total_skills: totalSkills,
            role_matches: roleMatches // Returning all matches too, just in case
        });

    } catch (error: any) {
        console.error("Resume analysis error:", error);
        return NextResponse.json({ error: `Error analyzing resume: ${error.message}` }, { status: 500 });
    }
}
