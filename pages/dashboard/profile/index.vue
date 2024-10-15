<template>
    <h1 class="text-2xl font-bold my-8">Profile Settings</h1>
    <UTabs v-model="selected" :items="tabItems" />
    <UCard class="mt-4">
        <!-- Personal Info Tab -->
        <template v-if="selected === 0">
            <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
                <CvUpload />
                <UForm :schema="personalInfoSchema" :state="profile" @submit="updatePersonalInfo">
                    <UFormGroup label="First Name" name="first_name" class="mb-4">
                        <UInput v-model="profile.first_name" icon="i-lucide-user" />
                    </UFormGroup>
                    <UFormGroup label="Last Name" name="last_name" class="mb-4">
                        <UInput v-model="profile.last_name" icon="i-lucide-user" />
                    </UFormGroup>
                    <UFormGroup label="Display Name" name="display_name" class="mb-4">
                        <UInput v-model="profile.display_name" icon="i-lucide-contact" />
                    </UFormGroup>
                    <UFormGroup label="Date of Birth" name="dob" class="mb-4">
                        <UInput v-model="profile.dob" icon="i-lucide-calendar" />
                    </UFormGroup>
                    <UFormGroup label="Gender" name="gender" class="mb-4">
                        <USelect v-model="profile.gender" :options="genderOptions" icon="i-lucide-users" />
                    </UFormGroup>
                    <UFormGroup label="Nationality" name="nationality" class="mb-4">
                        <USelect v-model="profile.nationality" :options="countryOptions" label="name"
                            icon="i-lucide-flag" />
                    </UFormGroup>
                    <UButton type="submit" :loading="saving">Save Personal Info</UButton>
                </UForm>
            </div>
        </template>

        <!-- Preferences Tab -->
        <template v-if="selected === 1">
            <UForm :schema="preferencesSchema" :state="profile" @submit="updatePreferences">
                <UFormGroup label="Preferred Job Title" name="preferred_job_title" class="mb-4">
                    <UInput v-model="profile.preferred_job_title" icon="i-lucide-briefcase" />
                </UFormGroup>
                <UFormGroup label="Preferred Region" name="preferred_region" class="mb-4">
                    <USelect v-model="profile.preferred_region" :options="REGION" icon="i-lucide-map-pin" />
                </UFormGroup>
                <UFormGroup label="Preferred Job Type" name="preferred_job_type" class="mb-4">
                    <USelect v-model="profile.preferred_job_type" :options="jobTypeOptions" icon="i-lucide-briefcase" />
                </UFormGroup>

                <!-- Skills Management Section -->
                <UFormGroup label="Skills" name="skills" class="mb-4">
                    <div class="flex gap-2 mb-2">
                        <UInput v-model="skillsInput" placeholder="Type a skill" @keydown.enter.prevent="addSkill"
                            icon="i-lucide-star" />
                        <UButton @click="addSkill" variant="outline">Add</UButton>
                    </div>
                    <div v-if="Array.isArray(skills) && skills.length" class="flex gap-2 flex-wrap mt-2">
                        <UBadge v-for="(skill, index) in skills" :key="index" class="mb-1" variant="subtle">
                            {{ skill }}
                            <UIcon name="i-lucide-x" @click="removeSkill(index)" class="ml-2 cursor-pointer" />
                        </UBadge>
                    </div>
                </UFormGroup>

                <UButton type="submit" :loading="saving">Save Preferences</UButton>
            </UForm>
        </template>

        <!-- Employment Tab -->
        <template v-if="selected === 2">
            <UForm :schema="employmentSchema" :state="employmentState" @submit="saveEmployment">
                <!-- About Me Section -->
                <UFormGroup label="About Me" name="experience" class="mb-4">
                    <UTextarea v-model="employmentState.experience" :rows="5" placeholder="Tell us about yourself"
                        icon="i-lucide-user" />
                </UFormGroup>

                <!-- Past Employment Section -->
                <div v-for="(employmentEntry, index) in employmentState.past_employment" :key="index" class="mb-6">
                    <UCard>
                        <UFormGroup :label="`Company ${index + 1}`" :name="`past_employment.${index}.company`"
                            class="mb-4">
                            <UInput v-model="employmentEntry.company" icon="i-lucide-building" />
                        </UFormGroup>
                        <UFormGroup :label="`Role ${index + 1}`" :name="`past_employment.${index}.role`" class="mb-4">
                            <UInput v-model="employmentEntry.role" icon="i-lucide-briefcase" />
                        </UFormGroup>
                        <UFormGroup :label="`Description ${index + 1}`" :name="`past_employment.${index}.description`"
                            class="mb-4">
                            <UTextarea v-model="employmentEntry.description" icon="i-lucide-briefcase" />
                        </UFormGroup>
                        <UFormGroup :label="`Start Date ${index + 1}`" :name="`past_employment.${index}.start_date`"
                            class="mb-4">
                            <UInput v-model="employmentEntry.start_date" icon="i-lucide-calendar-clock" />
                        </UFormGroup>
                        <UFormGroup :label="`End Date ${index + 1}`" :name="`past_employment.${index}.end_date`"
                            class="mb-4">
                            <UInput v-model="employmentEntry.end_date" icon="i-lucide-calendar-check" />
                        </UFormGroup>
                        <UButton color="red" @click="removeEmploymentEntry(index)" class="mt-2">
                            <UIcon name="i-lucide-trash-2" class="mr-1" /> Remove
                        </UButton>
                    </UCard>
                </div>
                <div class="flex gap-4 mt-4">
                    <UButton variant="outline" @click="addEmploymentEntry">
                        <UIcon name="i-lucide-plus" class="mr-1" /> Add Employment
                    </UButton>
                    <UButton type="submit" :loading="saving">Save Employment</UButton>
                </div>
            </UForm>
        </template>

        <!-- Education Tab -->
        <template v-if="selected === 3">
            <UForm :schema="educationSchema" :state="educationState" @submit="saveEducation">
                <div v-for="(educationEntry, index) in educationState.education" :key="index" class="mb-6">
                    <UCard>
                        <UFormGroup :label="`Institution ${index + 1}`" :name="`education.${index}.institution`"
                            class="mb-4">
                            <UInput v-model="educationEntry.institution" icon="i-lucide-building" />
                        </UFormGroup>
                        <UFormGroup :label="`Start Date ${index + 1}`" :name="`education.${index}.start_date`"
                            class="mb-4">
                            <UInput v-model="educationEntry.start_date" icon="i-lucide-calendar-clock" />
                        </UFormGroup>
                        <UFormGroup :label="`End Date ${index + 1}`" :name="`education.${index}.end_date`" class="mb-4">
                            <UInput v-model="educationEntry.end_date" icon="i-lucide-calendar-check" />
                        </UFormGroup>
                        <UFormGroup :label="`Programme ${index + 1}`" :name="`education.${index}.programme`"
                            class="mb-4">
                            <UInput v-model="educationEntry.programme" icon="i-lucide-book" />
                        </UFormGroup>
                        <UFormGroup :label="`Description ${index + 1}`" :name="`education.${index}.description`"
                            class="mb-4">
                            <UTextarea v-model="educationEntry.description" :rows="3" icon="i-lucide-file-text" />
                        </UFormGroup>
                        <UButton color="red" @click="removeEducationEntry(index)" class="mt-2">
                            <UIcon name="i-lucide-trash-2" class="mr-1" /> Remove
                        </UButton>
                    </UCard>
                </div>
                <div class="flex gap-4 mt-4">
                    <UButton @click="addEducationEntry" variant="outline">
                        <UIcon name="i-lucide-plus" class="mr-1" /> Add Education
                    </UButton>
                    <UButton type="submit" :loading="saving">Save Education</UButton>
                </div>
            </UForm>
        </template>
    </UCard>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { REGION } from '~/types/constants'
import CvUpload from '~/components/cv-upload.vue'
countries.registerLocale(enLocale)

const supabase: any = useSupabaseClient()
const { user } = useUser()

const profile = ref<UserProfile>({
    first_name: '',
    last_name: '',
    display_name: '',
    dob: null,
    gender: '',
    nationality: '',
    experience: '',
    preferred_job_title: '',
    preferred_employment_type: null,
    preferred_region: null,
    preferred_job_type: null,
})

const employmentState = ref({
    experience: '',
    past_employment: [] as PastEmploymentEntry[]
})

const educationState = ref({
    education: [] as EducationEntry[]
})

const skills = ref<string[]>([])
const skillsInput = ref('')

const addSkill = () => {
    const newSkill = skillsInput.value.trim()
    if (newSkill && !skills.value.includes(newSkill)) {
        skills.value.push(newSkill)
        skillsInput.value = ''
    }
}

const removeSkill = (index: number) => {
    skills.value.splice(index, 1)
}

// Tab management
const tabItems = [
    { label: 'Personal Info', icon: 'i-lucide-user' },
    { label: 'Preferences', icon: 'i-lucide-sliders' },
    { label: 'Employment', icon: 'i-lucide-briefcase' },
    { label: 'Education', icon: 'i-lucide-graduation-cap' }
]

const route = useRoute()
const router = useRouter()

const selected = computed({
    get() {
        const index = tabItems.findIndex((item) => item.label === route.query.tab)
        return index === -1 ? 0 : index
    },
    set(value) {
        router.replace({ query: { tab: tabItems[value].label } })
    }
})

// Save state
const saving = ref(false)

const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
]

const jobTypeOptions = [
    { label: 'Remote', value: 'remote' },
    { label: 'Onsite', value: 'onsite' },
    { label: 'Hybrid', value: 'hybrid' },
]

const countryOptions = Object.entries(countries.getNames('en')).map(([code, name]) => ({
    name: name, value: name,
}))

// --- Zod Schemas ---
const personalInfoSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    display_name: z.string().nullable(),
    dob: z.string().min(1, 'Date of birth is required'),
    gender: z.string().min(1, 'Gender is required'),
    nationality: z.string().min(1, 'Nationality is required')
})

const preferencesSchema = z.object({
    preferred_job_title: z.string().min(1, 'Preferred job title is required'),
    preferred_region: z.string().nullable(),
    preferred_job_type: z.string().nullable(),
})

const educationSchema = z.object({
    education: z.array(
        z.object({
            institution: z.string().min(1, 'Institution is required'),
            start_date: z.string().min(1, 'Start date is required'),
            end_date: z.string().nullable(),
            programme: z.string().min(1, 'Programme is required'),
            description: z.string().nullable(),
        })
    )
})

const employmentSchema = z.object({
    experience: z.string().nullable(),
    past_employment: z.array(
        z.object({
            company: z.string().min(1, 'Company is required'),
            role: z.string().min(1, 'Role is required'),
            description: z.string().nullable(),
            start_date: z.string().min(1, 'Start date is required'),
            end_date: z.string().nullable(),
        })
    )
})

// --- Fetch User Data ---
const fetchUserData = async () => {
    try {
        const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.value!.id)
            .single()

        if (profileError) throw profileError
        if (profileData) {
            profile.value = profileData
            employmentState.value.experience = profileData.experience
        }

        const { data: educationData, error: educationError } = await supabase
            .from('user_education')
            .select('*')
            .eq('user_id', user.value!.id)

        if (educationError) throw educationError
        educationState.value.education = educationData || []

        const { data: employmentData, error: employmentError } = await supabase
            .from('user_past_employment')
            .select('*')
            .eq('user_id', user.value!.id)

        if (employmentError) throw employmentError
        employmentState.value.past_employment = employmentData || []

        const { data: skillsData, error: skillsError } = await supabase
            .from('user_skills')
            .select('*')
            .eq('user_id', user.value!.id)

        if (skillsError) throw skillsError
        skills.value = skillsData ? skillsData.map((skill: { skill: string }) => skill.skill) : []
    } catch (error) {
        console.error('Error fetching user data:', error)
    }
}

onMounted(async () => {
    if (user.value) {
        await fetchUserData()
    }
})

// Watch for changes in user to refetch data
watch(() => user.value, async (newUser) => {
    if (newUser) {
        await fetchUserData()
    }
})

// --- Submission Handlers ---
const updatePersonalInfo = async () => {
    saving.value = true
    try {
        const validatedData = personalInfoSchema.parse(profile.value)
        const { error } = await supabase
            .from('user_profiles')
            .update({
                user_id: user.value!.id,
                ...validatedData
            })
            .eq('user_id', user.value!.id)

        if (error) throw error
        await fetchUserData()
    } catch (error) {
        console.error('Error updating personal info:', error)
    } finally {
        saving.value = false
    }
}

const updatePreferences = async () => {
    saving.value = true
    try {
        const validatedData = preferencesSchema.parse(profile.value)
        const { error: profileError } = await supabase
            .from('user_profiles')
            .update({
                user_id: user.value!.id,
                ...validatedData
            })
            .eq('user_id', user.value!.id)

        if (profileError) throw profileError

        // Update skills
        await supabase
            .from('user_skills')
            .delete()
            .eq('user_id', user.value!.id)

        const skillPromises = skills.value.map((skill: string) =>
            supabase.from('user_skills').insert({
                user_id: user.value!.id,
                skill: skill
            })
        )

        await Promise.all(skillPromises)

        await fetchUserData()
    } catch (error) {
        console.error('Error updating preferences and skills:', error)
    } finally {
        saving.value = false
    }
}

const saveEmployment = async () => {
    saving.value = true
    try {
        const validatedData = employmentSchema.parse(employmentState.value)

        // Update experience in user_profiles
        const { error: profileError } = await supabase
            .from('user_profiles')
            .update({ experience: validatedData.experience })
            .eq('user_id', user.value!.id)

        if (profileError) throw profileError

        // Update past employment
        await supabase.from('user_past_employment')
            .delete()
            .eq('user_id', user.value!.id)

        const employmentPromises = validatedData.past_employment.map((entry: PastEmploymentEntry) =>
            supabase.from('user_past_employment').insert({
                user_id: user.value!.id,
                company: entry.company,
                role: entry.role,
                description: entry.description,
                start_date: entry.start_date,
                end_date: entry.end_date,
            })
        )

        await Promise.all(employmentPromises)
        await fetchUserData()
    } catch (error) {
        console.error('Error saving employment:', error)
    } finally {
        saving.value = false
    }
}

const saveEducation = async () => {
    saving.value = true
    try {
        const validatedData = educationSchema.parse(educationState.value)
        await supabase.from('user_education')
            .delete()
            .eq('user_id', user.value!.id)

        const educationPromises = validatedData.education.map((entry: EducationEntry) =>
            supabase.from('user_education').insert({
                user_id: user.value!.id,
                institution: entry.institution,
                start_date: entry.start_date,
                end_date: entry.end_date,
                programme: entry.programme,
                description: entry.description,
            })
        )

        await Promise.all(educationPromises)
        await fetchUserData()
    } catch (error) {
        console.error('Error saving education:', error)
    } finally {
        saving.value = false
    }
}

// --- Employment and Education Management ---
const addEmploymentEntry = () => {
    employmentState.value.past_employment.push({
        company: '',
        role: '',
        description: '',
        start_date: '',
        end_date: null
    })
}

const removeEmploymentEntry = (index: number) => {
    employmentState.value.past_employment.splice(index, 1)
}

const addEducationEntry = () => {
    educationState.value.education.push({ institution: '', start_date: '', end_date: null, programme: '', description: '' })
}

const removeEducationEntry = (index: number) => {
    educationState.value.education.splice(index, 1)
}
</script>