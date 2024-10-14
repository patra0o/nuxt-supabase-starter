<script setup lang="ts">
import type { Job } from '~/types/Job'
import { cutText } from '~/utils/textHandler';
import { useUserFavourites } from '~/composables/use-user-favourites';


const props = defineProps<{
    job: Job,

}>()

const formattedPostedDate = computed(() => formatDate(props.job.posted_date))
const formattedClosingDate = computed(() => formatDate(props.job.closing_date))
const daysUntilClosing = computed(() => calculateDaysUntil(props.job.closing_date))
const formattedLocation = computed(() => cutText((props.job.physical_address), 30))
const formattedTitle = computed(() => cutText((props.job.job_title), 50))

const statusColor = computed(() => {
    switch (props.job.employment_status) {
        case 'Permanent':
            return 'green'
        case 'Contract':
            return 'blue'
        case 'Temporary':
            return 'orange'
        case 'Apprenticeship':
            return 'purple'
        default:
            return 'gray'
    }
})

const { addFavourite, removeFavourite, isFavourite } = useUserFavourites();

const toggleFavourite = (event: Event) => {
    event.stopPropagation();
    if (isFavourite(props.job.job_id)) {
        removeFavourite(props.job.job_id);
    } else {
        addFavourite(props.job.job_id);
    }
}


</script>

<template>
    <div class="job-card border border-base-200 dark:border-gray-100/10 p-3 rounded-md shadow-md">
        <div class="flex items-center justify-between">
            <h1 class="font-bold mb-1">{{ formattedTitle }}</h1>
            <UIcon :name="isFavourite(job.job_id) ? 'i-heroicons-heart-solid' : 'i-lucide-heart'" :class="{
                'text-red-400': isFavourite(job.job_id),
                'text-slate-400': !isFavourite(job.job_id)
            }" class="w-5 h-5 cursor-pointer" @click="toggleFavourite" />

        </div>
        <h2 class="text-md font-medium mb-2 text-primary">{{ job.company }}</h2>
        <div class="flex gap-2 items-center mb-1">
            <UIcon name="i-lucide-map-pin" class="text-slate-400"></UIcon>
            <div class="text-sm opacity-75">
                {{ formattedLocation }} {{ job.region }}
            </div>
        </div>
        <div class="flex items-center gap-5">
            <div class="flex items-center gap-2">
                <UIcon name="i-lucide-clock" class="text-slate-400"></UIcon>
                <p class="text-sm opacity-75"> Posted {{ formattedPostedDate }}</p>
            </div>
            <div class="flex items-center gap-2">
                <UIcon name="i-lucide-clock" class="text-slate-400"></UIcon>
                <p class="text-sm opacity-75"> Closing {{ formattedClosingDate }}</p>
            </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
            <UBadge variant="soft" v-if="job.employment_status" :color="statusColor">
                {{ job.employment_status }}
            </UBadge>
            <UBadge variant="soft" v-if="job.employment_type">
                {{ job.employment_type }}
            </UBadge>
        </div>

    </div>
</template>

<style scoped>
.job-card {
    transition: all 0.3s ease;
}

.job-card:hover {
    transform: translateY(-5px);
    cursor: pointer;
}
</style>