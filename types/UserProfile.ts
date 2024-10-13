interface UserProfile {
    first_name: string
    last_name: string
    display_name: string
    dob: Date | null
    gender: string
    nationality: string
    education: EducationEntry[]
    skills: string[]
    experience: string
    past_employment: any
    preferred_job_title: string
    preferred_employment_type: string
    preferred_region: string
    preferred_job_type: string
}