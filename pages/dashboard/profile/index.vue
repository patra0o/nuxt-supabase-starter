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
                        <UInput v-model="profile.dob" type="date" icon="i-lucide-calendar" />
                    </UFormGroup>
                    <UFormGroup label="Gender" name="gender" class="mb-4">
                        <USelect v-model="profile.gender" :options="genderOptions" icon="i-lucide-users" />
                    </UFormGroup>
                    <UFormGroup label="Nationality" name="nationality" class="mb-4">
                        <USelect v-model="profile.nationality" :options="countryOptions" label="name"
                            icon="i-lucide-flag" />
                    </UFormGroup>
                    <UButton type="submit" color="primary" :loading="saving">Save</UButton>
                </UForm>
            </div>

        </template>

        <!-- Preferences Tab -->
        <template v-if="selected === 1">
            <UForm :schema="preferencesSchema" :state="profile" @submit="updatePreferences">
                <UFormGroup label="Preferred Job Title" name="preferred_job_title" class="mb-4">
                    <UInput v-model="profile.preferred_job_title" icon="i-lucide-briefcase" />
                </UFormGroup>

                <!-- Skills Management Section -->
                <UFormGroup label="Skills" name="skills" class="mb-4">
                    <div class="flex gap-2 mb-2">
                        <UInput v-model="skillsInput" placeholder="Type a skill" @keydown.enter.prevent="addSkill"
                            icon="i-lucide-star" />
                        <UButton @click="addSkill" variant="outline">Add</UButton>
                    </div>
                    <div v-if="Array.isArray(profile.skills) && profile.skills.length" class="flex gap-2 flex-wrap">
                        <UBadge v-for="(skill, index) in profile.skills" :key="index" class="mb-2" variant="subtle">
                            {{ skill }}
                            <UIcon name="i-lucide-x" @click="removeSkill(index)" class="ml-2 cursor-pointer" />
                        </UBadge>
                    </div>
                </UFormGroup>

                <UFormGroup label="Preferred Region" name="preferred_region" class="mb-4">
                    <USelect v-model="profile.preferred_region" :options="REGION" icon="i-lucide-map-pin" />
                </UFormGroup>
                <UFormGroup label="Preferred Job Type" name="preferred_job_type" class="mb-4">
                    <USelect v-model="profile.preferred_job_type" :options="jobTypeOptions" icon="i-lucide-briefcase" />
                </UFormGroup>
                <UButton type="submit" color="primary" :loading="saving">Save</UButton>
            </UForm>
        </template>

        <!-- Employment Tab -->
        <template v-if="selected === 2">
            <UForm :schema="employmentSchema" :state="profile" @submit="saveEmployment">
                <!-- About Me Section -->
                <UFormGroup label="About Me" name="about_me" class="mb-4">
                    <UTextarea v-model="profile.about_me" :rows="5" placeholder="Tell us about yourself"
                        icon="i-lucide-user" />
                </UFormGroup>

                <!-- Past Employment Section -->
                <div v-for="(employmentEntry, index) in profile.past_employment" :key="index" class="mb-6">
                    <UCard>
                        <UFormGroup :label="`Company ${index + 1}`" :name="`employment.${index}.company`" class="mb-4">
                            <UInput v-model="employmentEntry.company" icon="i-lucide-building" />
                        </UFormGroup>
                        <UFormGroup :label="`Role ${index + 1}`" :name="`employment.${index}.role`" class="mb-4">
                            <UInput v-model="employmentEntry.role" icon="i-lucide-briefcase" />
                        </UFormGroup>
                        <UFormGroup :label="`Description ${index + 1}`" :name="`employment.${index}.description`"
                            class="mb-4">
                            <UTextarea v-model="employmentEntry.description" icon="i-lucide-briefcase" />
                        </UFormGroup>
                        <UFormGroup :label="`Start Date ${index + 1}`" :name="`employment.${index}.start`" class="mb-4">
                            <UInput v-model="employmentEntry.start" type="date" icon="i-lucide-calendar-clock" />
                        </UFormGroup>
                        <UFormGroup :label="`End Date ${index + 1}`" :name="`employment.${index}.end`" class="mb-4">
                            <UInput v-model="employmentEntry.end" type="date" icon="i-lucide-calendar-check" />
                        </UFormGroup>
                        <UButton color="danger" @click="removeEmploymentEntry(index)" class="mt-2">
                            <UIcon name="i-lucide-trash-2" class="mr-1" /> Remove
                        </UButton>
                    </UCard>
                </div>
                <div class="flex gap-4 mt-4">
                    <UButton variant="outline" @click="addEmploymentEntry">
                        <UIcon name="i-lucide-plus" class="mr-1" /> Add Employment
                    </UButton>
                    <UButton type="submit" color="primary" :loading="saving">Save</UButton>
                </div>
            </UForm>
        </template>

        <!-- Education Tab -->
        <template v-if="selected === 3">
            <UForm :schema="educationSchema" :state="profile" @submit="saveEducation">
                <div v-for="(educationEntry, index) in profile.education" :key="index" class="mb-6">
                    <UCard>
                        <UFormGroup :label="`Institution ${index + 1}`" :name="`education.${index}.institution`"
                            class="mb-4">
                            <UInput v-model="educationEntry.institution" icon="i-lucide-building" />
                        </UFormGroup>
                        <UFormGroup :label="`Start Date ${index + 1}`" :name="`education.${index}.start`" class="mb-4">
                            <UInput v-model="educationEntry.start" type="date" icon="i-lucide-calendar-clock" />
                        </UFormGroup>
                        <UFormGroup :label="`End Date ${index + 1}`" :name="`education.${index}.end`" class="mb-4">
                            <UInput v-model="educationEntry.end" type="date" icon="i-lucide-calendar-check" />
                        </UFormGroup>
                        <UFormGroup :label="`Programme ${index + 1}`" :name="`education.${index}.programme`"
                            class="mb-4">
                            <UInput v-model="educationEntry.programme" icon="i-lucide-book" />
                        </UFormGroup>
                        <UFormGroup :label="`Description ${index + 1}`" :name="`education.${index}.description`"
                            class="mb-4">
                            <UTextarea v-model="educationEntry.description" :rows="3" icon="i-lucide-file-text" />
                        </UFormGroup>
                        <UButton color="danger" @click="removeEducationEntry(index)" class="mt-2">
                            <UIcon name="i-lucide-trash-2" class="mr-1" /> Remove
                        </UButton>
                    </UCard>
                </div>
                <div class="flex gap-4 mt-4">
                    <UButton color="primary" @click="addEducationEntry" variant="outline">
                        <UIcon name="i-lucide-plus" class="mr-1" /> Add Education
                    </UButton>
                    <UButton type="submit" color="primary" :loading="saving">Save</UButton>
                </div>
            </UForm>
        </template>
    </UCard>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { REGION } from '~/types/constants'
import CvUpload from '~/components/cv-upload.vue'
countries.registerLocale(enLocale)

const supabase: any = useSupabaseClient()
const { user } = useUser()

// Default user profile structure
const profile = ref<UserProfile>({
    first_name: '',
    last_name: '',
    display_name: '',
    dob: null,
    gender: '',
    nationality: '',
    education: [],
    skills: [],
    about_me: '',
    past_employment: [],
    preferred_job_title: '',
    preferred_employment_type: '',
    preferred_region: '',
    preferred_job_type: '',
})

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

// --- Skill management ---
const skillsInput = ref('')

const addSkill = () => {
    if (!Array.isArray(profile.value.skills)) {
        profile.value.skills = []
    }

    const newSkill = skillsInput.value.trim()
    if (newSkill !== '' && !profile.value.skills.includes(newSkill)) {
        profile.value.skills.push(newSkill)
        skillsInput.value = ''
    }
}

const removeSkill = (index: number) => {
    if (Array.isArray(profile.value.skills)) {
        profile.value.skills.splice(index, 1)
    }
}

// --- About Me and Employment management ---
const addEmploymentEntry = () => {
    if (!Array.isArray(profile.value.past_employment)) {
        profile.value.past_employment = []
    }

    profile.value.past_employment.push({ company: '', role: '', description: '', start: '', end: '' })
}
const removeEmploymentEntry = (index: number) => {
    profile.value.past_employment.splice(index, 1)
}

// --- Education management ---
const addEducationEntry = () => {
    if (!Array.isArray(profile.value.education)) {
        profile.value.education = []
    }
    profile.value.education.push({ institution: '', start: '', end: '', programme: '', description: '' })
}
const removeEducationEntry = (index: number) => {
    profile.value.education.splice(index, 1)
}

// --- Schemas for Validation ---
const personalInfoSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    display_name: z.string().min(1, 'Display name is required'),
    dob: z.string().nullable(),
    gender: z.string(),
    nationality: z.string(),
})

const preferencesSchema = z.object({
    preferred_job_title: z.string(),
    preferred_region: z.string(),
    preferred_job_type: z.string(),
})

const employmentSchema = z.object({
    about_me: z.string(),
    past_employment: z.array(
        z.object({
            company: z.string().min(1, 'Company is required'),
            role: z.string().min(1, 'Role is required'),
            description: z.string().nullable(),
            start: z.string().min(1, 'Start date is required'),
            end: z.string(),
        })
    ),
})

// Education schema
const educationSchema = z.object({
    education: z.array(
        z.object({
            institution: z.string().min(1, 'Institution is required'),
            start: z.string().min(1, 'Start date is required'),
            end: z.string(),
            programme: z.string().min(1, 'Programme is required'),
            description: z.string(),
        })
    ),
})

// --- Form Submission Handlers ---

const updatePersonalInfo = async () => {
    saving.value = true
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                first_name: profile.value.first_name,
                last_name: profile.value.last_name,
                display_name: profile.value.display_name,
                dob: profile.value.dob,
                gender: profile.value.gender,
                nationality: profile.value.nationality,
            })
            .eq('user_id', user.value!.id)

        if (error) throw error
    } catch (error) {
        console.error('Error updating personal info:', error)
    } finally {
        saving.value = false
    }
}

const updatePreferences = async () => {
    saving.value = true
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                preferred_job_title: profile.value.preferred_job_title,
                preferred_region: profile.value.preferred_region,
                preferred_job_type: profile.value.preferred_job_type,
                skills: profile.value.skills
            })
            .eq('user_id', user.value!.id)

        if (error) throw error
    } catch (error) {
        console.error('Error updating preferences:', error)
    } finally {
        saving.value = false
    }
}

const saveEmployment = async () => {
    saving.value = true
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                about_me: profile.value.about_me,
                past_employment: profile.value.past_employment,
            })
            .eq('user_id', user.value!.id)

        if (error) throw error
    } catch (error) {
        console.error('Error saving employment:', error)
    } finally {
        saving.value = false
    }
}

const saveEducation = async () => {
    saving.value = true
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                education: profile.value.education,
            })
            .eq('user_id', user.value!.id)

        if (error) throw error
    } catch (error) {
        console.error('Error saving education:', error)
    } finally {
        saving.value = false
    }
}

onMounted(async () => {
    if (user.value) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.value.id)
            .single()

        if (data) {
            profile.value = data
        } else if (error) {
            console.error('Error fetching profile:', error)
        }
    }
})
</script>
