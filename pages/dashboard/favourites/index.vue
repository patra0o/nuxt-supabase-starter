<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSupabaseClient } from '#imports'
import type { Job } from '~/types/Job'
import JobCard from '~/components/job-card.vue'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';

const supabase = useSupabaseClient()
const { favourites, isLoading: isFavouritesLoading } = useUserFavourites()

const favoriteJobs = ref<Job[]>([])
const isLoading = ref(true)

const fetchFavoriteJobs = async () => {
    isLoading.value = true
    const { data, error } = await supabase
        .from('jobs_archive')
        .select('*')
        .in('job_id', favourites.value)

    if (error) {
        console.error('Error fetching favorite jobs:', error)
        isLoading.value = false
        return
    }

    favoriteJobs.value = data as Job[]
    isLoading.value = false
}

const goToJobDetail = (job_id: string) => {
    navigateTo(`./jobs/${job_id}`);
};

onMounted(async () => {
    await fetchFavoriteJobs()
})

watch(favourites, async (newFavorites, oldFavorites) => {
    if (newFavorites.length !== oldFavorites.length) {
        await fetchFavoriteJobs()
    }
})

const hasFavorites = computed(() => favoriteJobs.value.length > 0)
</script>

<template>
    <div class="container mx-auto  py-12">
        <h1 class="text-2xl font-bold mb-6">Your Saved Jobs</h1>
        <div v-if="isLoading || isFavouritesLoading" class="flex justify-center items-center h-[80vh]">
            <DotLottieVue style="width: 20rem; height: 20rem;" autoplay loop src="/ai_load.lottie" />
        </div>

        <div v-else-if="hasFavorites" class="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-6">
            <JobCard v-for="job in favoriteJobs" :key="job.job_id" :job="job" @click="goToJobDetail(job.job_id)" />
        </div>

        <div v-else class="text-center py-12">
            <UIcon name="i-heroicons-heart" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 class="text-xl font-semibold mb-2">No favorite jobs yet</h2>
            <p class="text-gray-600 mb-4">Start adding jobs to your favorites to see them here.</p>
            <UButton to="/" icon="i-heroicons-arrow-left" variant="outline">
                Browse Jobs
            </UButton>
        </div>
    </div>
</template>