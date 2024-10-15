interface EducationEntry {
    institution: string
    start_date: string
    end_date: string | null
    programme: string
    description: string | null
}

interface Skill {
    skill: string;
}

interface PastEmploymentEntry {
    company: string
    role: string
    description: string | null
    start_date: string
    end_date: string | null
}

interface UserProfile {
    first_name: string
    last_name: string
    display_name: string
    dob: string | null
    gender: string
    nationality: string
    experience: string
    preferred_job_title: string
    preferred_employment_type: string | null
    preferred_region: string | null
    preferred_job_type: string | null
}

interface UserProfileWithDetails extends UserProfile {
    education: EducationEntry[]
    skills: string[]
    past_employment: PastEmploymentEntry[]
}
