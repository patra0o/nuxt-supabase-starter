<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { sub, format, isSameDay, type Duration } from 'date-fns';
import { EMPLOYMENT_STATUS, EMPLOYMENT_TYPES, ranges, REGION, TYPE_OF_NOTIFICATION } from '~/types/constants';
import JobCard from '~/components/job-card.vue';
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';
import { useJobs } from '~/composables/use-jobs';
import { useUserFavourites } from '~/composables/use-user-favourites';
const { user } = useUser();

const {
  jobs,
  isLoading,
  currentPage,
  totalPages,
  fetchJobs,
  searchQuery,
  selectedEmploymentTypes,
  selectedNotifications,
  selectedStatuses,
  selectedRegions,
  dateRange,
  selectedCompanies,
  companyOptions,
  fetchCompanies,
} = useJobs();

const {
  fetchFavourites
} = useUserFavourites();
const selected = ref<{ start: Date | string; end: Date | string }>({
  start: '',
  end: '',
});

function isRangeSelected(duration: Duration) {
  const startDate = selected.value.start ? new Date(selected.value.start) : null;
  const endDate = selected.value.end ? new Date(selected.value.end) : null;

  if (!startDate || !endDate) return false;

  return isSameDay(startDate, sub(new Date(), duration)) && isSameDay(endDate, new Date());
}

function selectRange(duration: Duration) {
  selected.value = {
    start: sub(new Date(), duration),
    end: new Date(),
  };
  applyFilters();
}

const applyFilters = () => {
  if (selected.value.start && selected.value.end) {
    dateRange.value = {
      start: format(new Date(selected.value.start), 'yyyy-MM-dd'),
      end: format(new Date(selected.value.end), 'yyyy-MM-dd'),
    };
  } else {
    dateRange.value = { start: null, end: null };
  }

  fetchJobs(1);
};

onMounted(() => {
  fetchJobs(currentPage.value);
  fetchCompanies();
  fetchFavourites();

});

watch(user, (newUser) => {
  if (newUser) {
    fetchFavourites();
  }
});

watch(selected, () => {
  applyFilters();
});

watch(currentPage, (newPage) => {
  fetchJobs(newPage);
});

const goToJobDetail = (job_id: string) => {
  navigateTo(`dashboard/jobs/${job_id}`);
};

</script>


<template>
  <div v-if="isLoading" class="flex justify-center items-center h-screen">
    <DotLottieVue style="width: 20rem; height: 20rem;" autoplay loop src="/ai_load.lottie" />
  </div>
  <div v-else>
    <div class="w-full mx-auto my-4 container">
      <h1 class="text-2xl font-bold my-6">Welcome to Tulongeni</h1>

      <div class="flex flex-col md:flex-row gap-4 mb-4">
        <UInput v-model="searchQuery" @input="applyFilters" type="text" icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Search job title or description..." class="w-full md:w-1/3 " />

        <USelectMenu v-model="selectedRegions" :options="REGION" icon="i-lucide-map-pin" placeholder="Select region"
          :multiple="true" :searchable="true" @update:modelValue="applyFilters" class="w-full md:w-1/3" />

        <UPopover :popper="{ placement: 'bottom-start' }">
          <UButton icon="i-heroicons-calendar-days-20-solid" variant="outline">
            <span v-if="selected.start && selected.end">
              {{ format(new Date(selected.start), 'd MMM, yyyy') }} - {{ format(new Date(selected.end), 'd MMM, yyyy')
              }}
            </span>
            <span v-else>
              Select a date range
            </span>
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

      <div class="flex flex-col md:flex-row gap-4 mb-7">
        <USelectMenu v-model="selectedCompanies" :options="companyOptions" placeholder="Select company" :multiple="true"
          :searchable="true" @update:modelValue="applyFilters" class="w-full md:w-1/3" />

        <USelectMenu v-model="selectedStatuses" :options="EMPLOYMENT_STATUS" placeholder="Select employment status"
          :multiple="true" :searchable="true" @update:modelValue="applyFilters" class="w-full md:w-1/3" />

        <USelectMenu v-model="selectedEmploymentTypes" :options="EMPLOYMENT_TYPES" placeholder="Select employment type"
          :multiple="true" :searchable="true" @update:modelValue="applyFilters" class="w-full md:w-1/3" />

        <USelectMenu v-model="selectedNotifications" :options="TYPE_OF_NOTIFICATION"
          placeholder="Select type of notification" :multiple="true" :searchable="true"
          @update:modelValue="applyFilters" class="w-full md:w-1/3" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <JobCard v-for="job in jobs" :key="job.job_id" :job="job" @click="goToJobDetail(job.job_id)" />
      </div>

      <div v-if="totalPages > 1" class="flex justify-center mt-4">
        <UPagination v-model="currentPage" :total="totalPages" />
      </div>
    </div>
  </div>
</template>
