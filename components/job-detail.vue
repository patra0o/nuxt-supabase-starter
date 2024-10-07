<script setup lang="ts">
import type { Job } from '~/types/Job'

const props = defineProps<{
    job: Job
}>()

const formattedPostedDate = computed(() => formatDate(props.job.posted_date))
const formattedClosingDate = computed(() => formatDate(props.job.closing_date))
const daysUntilClosing = computed(() => calculateDaysUntil(props.job.closing_date))

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

</script>

<template>
    <UCard>
        <div class="space-y-4">
            <div class="grid gap-4">
                <div>
                    <p class="text-sm text-gray-500">Location</p>
                    <p>{{ job.physical_address }} {{ job.region }}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Posted Date</p>
                    <p>{{ formattedPostedDate }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Closing Date</p>
                    <p>{{ formattedClosingDate }}</p>
                </div>
            </div>

            <div class="text-sm" v-html="job.description"></div>
        </div>

        <template #footer>
            <div class="flex justify-between items-center mt-auto">
                <div class="flex flex-wrap gap-2">
                    <UBadge v-if="job.employment_status" :color="statusColor">
                        {{ job.employment_status }}
                    </UBadge>
                    <UBadge v-if="job.employment_type">
                        {{ job.employment_type }}
                    </UBadge>
                </div>

                <p class="text-sm font-semibold" :class="daysUntilClosing <= 3 ? 'text-red-500' : 'text-gray-600'">
                    {{ daysUntilClosing }} days left to apply
                </p>
            </div>
        </template>
    </UCard>
</template>