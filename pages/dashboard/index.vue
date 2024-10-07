<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { sub, format, isSameDay, type Duration } from 'date-fns'
import { EMPLOYMENT_STATUS, EMPLOYMENT_TYPES, ranges, REGION, TYPE_OF_NOTIFICATION } from '~/types/constants'
import JobCard from '~/components/job-card.vue';
import type { Job } from '~/types/Job';
import JobDetail from '~/components/job-detail.vue';

useSeoMeta({
  title: 'Dashboard - Tulongeni',
})

const { jobs, isLoading, currentPage, totalPages, fetchJobs, searchQuery, selectedEmploymentTypes, selectedNotifications, selectedStatuses, selectedRegions, dateRange } = useJobs()

const selected = ref({ start: sub(new Date(), { days: 14 }), end: new Date() })

function isRangeSelected(duration: Duration) {
  return isSameDay(selected.value.start, sub(new Date(), duration)) && isSameDay(selected.value.end, new Date())
}

function selectRange(duration: Duration) {
  selected.value = { start: sub(new Date(), duration), end: new Date() }
  applyFilters()
}

const applyFilters = () => {
  dateRange.value = {
    start: format(selected.value.start, 'yyyy-MM-dd'),
    end: format(selected.value.end, 'yyyy-MM-dd'),
  }
  fetchJobs(1)
}

onMounted(() => {
  fetchJobs(currentPage.value)
})

watch(selected, () => {
  applyFilters()
})

watch(currentPage, (newPage) => {
  fetchJobs(newPage)
})

const isOpen = ref(false)
const selectedJob = ref<Job | null>(null)

const openModal = (job: Job) => {
  selectedJob.value = job
  isOpen.value = true
}

</script>

<template>
  <div class="w-full mx-auto my-4 space-y-[30px] max-w-7xl">
    <h1 class="text-2xl font-bold pt-5 max-w-[400px]">Welcome to Tulongeni</h1>
    <div class="flex flex-col md:flex-row gap-4 mb-1">
      <UInput v-model="searchQuery" @input="applyFilters" type="text" icon="i-heroicons-magnifying-glass-20-solid"
        placeholder="Search job title or description..." class="w-full md:w-1/3 " />

      <USelectMenu v-model="selectedRegions" :options="REGION" icon="i-lucide-map-pin" placeholder="Select region"
        :multiple="true" :searchable="true" @update:modelValue="applyFilters" class="w-full md:w-1/3" />

      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton icon="i-heroicons-calendar-days-20-solid" variant="outline">
          {{ format(selected.start, 'd MMM, yyy') }} - {{ format(selected.end, 'd MMM, yyy') }}
        </UButton>
        <template #panel="{ close }">
          <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
            <div class="hidden sm:flex flex-col py-4">
              <UButton v-for="(range, index) in ranges" :key="index" :label="range.label" color="gray" variant="ghost"
                class="rounded-none px-6"
                :class="[isRangeSelected(range.duration) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
                truncate @click="selectRange(range.duration)" />
            </div>
            <DatePicker v-model="selected" @close="close" />
          </div>
        </template>
      </UPopover>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-4">
      <USelectMenu v-model="selectedStatuses" :options="EMPLOYMENT_STATUS" placeholder="Select employment status"
        :multiple="true" :searchable="true" @update:modelValue="applyFilters" class="w-full md:w-1/3" />
      <USelectMenu v-model="selectedEmploymentTypes" :options="EMPLOYMENT_TYPES" placeholder="Select employment type"
        :multiple="true" :searchable="true" @update:modelValue="applyFilters" class="w-full md:w-1/3" />
      <USelectMenu v-model="selectedNotifications" :options="TYPE_OF_NOTIFICATION"
        placeholder="Select type of notification" :multiple="true" :searchable="true" @update:modelValue="applyFilters"
        class="w-full md:w-1/3" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <JobCard v-for="job in jobs" :key="job.job_id" :job="job" @click="openModal(job)" />
    </div>

    <div v-if="totalPages > 1" class="flex justify-center mt-4">
      <UPagination v-model="currentPage" :total="totalPages" />
    </div>

    <UModal v-model="isOpen" fullscreen>
      <UCard :ui="{
        base: 'h-100 flex flex-col overflow-y-auto',
        rounded: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        body: {
          base: 'grow'
        }
      }">
        <template #header fixed>
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold mb-1 leading-6 text-gray-900 dark:text-white">
                {{ selectedJob?.job_title }}
              </h1>
              <p class="text-base text-primary-400">{{ selectedJob?.company }}</p>
            </div>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="isOpen = false" />
          </div>
        </template>
        <JobDetail v-if="selectedJob" :job="selectedJob" />
      </UCard>
    </UModal>

  </div>
</template>
