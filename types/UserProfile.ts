
interface EducationEntry {
    institution: string
    start: string
    end: string
    programme: string
    description: string
}

interface PastEmploymentEntry {
    company: string
    role: string
    start: string
    end: string
}

interface UserProfile {
    first_name: string
    last_name: string
    display_name: string
    dob: string | number | null
    gender: string
    nationality: string
    education: EducationEntry[]
    skills: string[]
    about_me: string
    past_employment: PastEmploymentEntry[]
    preferred_job_title: string
    preferred_employment_type: string
    preferred_region: string
    preferred_job_type: string
}
