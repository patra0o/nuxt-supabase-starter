<template>
    <h1 class="text-2xl font-bold my-8">Profile Settings</h1>
    <UTabs v-model="selected" :items="tabItems" />
    <UCard class="mt-4">
        <div v-if="selected === 0">
            <!-- Personal Info Form -->
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

        <div v-if="selected === 1">
            <!-- Preferences Form -->
            <UForm :schema="preferencesSchema" :state="profile" @submit="updatePreferences">
                <UFormGroup label="Preferred Job Title" name="preferred_job_title" class="mb-4">
                    <UInput v-model="profile.preferred_job_title" icon="i-lucide-briefcase" />
                </UFormGroup>
                <UFormGroup label="Skills (separated by comma)" name="skills" class="mb-4">
                    <UInput v-model="skillsInput" @input="processSkills"
                        placeholder="Enter your skills, separated by commas" icon="i-lucide-star" />
                </UFormGroup>
                <div class="text-sm text-gray-500 mb-4">
                    <span v-if="parsedSkills.length">Parsed skills: {{ parsedSkills.join(', ') }}</span>
                </div>
                <!-- <UFormGroup label="Preferred Employment Type" name="preferred_employment_type" class="mb-4">
                    <UInput v-model="profile.preferred_employment_type" icon="i-lucide-clock" />
                </UFormGroup> -->
                <UFormGroup label="Preferred Region" name="preferred_region" class="mb-4">
                    <USelect v-model="profile.preferred_region" :options="REGION" icon="i-lucide-map-pin" />
                </UFormGroup>
                <UFormGroup label="Preferred Job Type" name="preferred_job_type" class="mb-4">
                    <USelect v-model="profile.preferred_job_type" :options="jobTypeOptions" icon="i-lucide-briefcase" />
                </UFormGroup>
                <UButton type="submit" color="primary" :loading="saving">Save</UButton>
            </UForm>
        </div>

        <div v-if="selected === 2">
            <!-- Employment Form -->
            <UForm :schema="employmentSchema" :state="profile" @submit="saveEmployment">
                <UFormGroup label="Past Employment" name="past_employment" class="mb-4">
                    <UTextarea v-model="profile.past_employment" :rows="5" placeholder="Describe your past employment"
                        icon="i-lucide-briefcase" />
                </UFormGroup>
                <UButton type="submit" color="primary" :loading="saving">Save</UButton>
            </UForm>
        </div>

        <div v-if="selected === 3">
            <!-- Education Form -->
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
                    <UButton color="primary" @click="addEducationEntry">
                        <UIcon name="i-lucide-plus" class="mr-1" /> Add Education
                    </UButton>
                    <UButton type="submit" color="primary" :loading="saving">Save</UButton>
                </div>
            </UForm>
        </div>
    </UCard>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { REGION } from '~/types/constants'
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
    education: [],
    skills: [],
    experience: '',
    past_employment: '',
    preferred_job_title: '',
    preferred_employment_type: '',
    preferred_region: '',
    preferred_job_type: '',
})

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

const skillsInput = ref('')
const parsedSkills = ref<string[]>([])

const processSkills = () => {
    parsedSkills.value = skillsInput.value
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill !== '')
}

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
    // preferred_employment_type: z.string(),
    preferred_region: z.string(),
    preferred_job_type: z.string(),
})

const employmentSchema = z.object({
    past_employment: z.string(),
})

const educationEntrySchema = z.object({
    institution: z.string().min(1, 'Institution is required'),
    start: z.string().min(1, 'Start date is required'),
    end: z.string(),
    programme: z.string().min(1, 'Programme is required'),
    description: z.string(),
})

const educationSchema = z.object({
    education: z.array(educationEntrySchema),
})

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

const updatePersonalInfo = async () => {
    saving.value = true
    try {
        profile.value.skills = skillsInput.value.split(',').map(skill => skill.trim())

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
        profile.value.skills = parsedSkills.value

        const { error } = await supabase
            .from('user_profiles')
            .update({
                preferred_job_title: profile.value.preferred_job_title,
                // preferred_employment_type: profile.value.preferred_employment_type,
                preferred_region: profile.value.preferred_region,
                preferred_job_type: profile.value.preferred_job_type,
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

const addEducationEntry = () => {
    const newEducationEntry: EducationEntry = {
        institution: '',
        start: '',
        end: '',
        programme: '',
        description: ''
    }
    profile.value.education.push(newEducationEntry)
}

const removeEducationEntry = (index: number) => {
    profile.value.education.splice(index, 1)
}
</script>