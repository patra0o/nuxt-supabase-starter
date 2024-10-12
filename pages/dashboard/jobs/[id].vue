<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JobDetail from '~/components/job-detail.vue'
import ChatBot from '~/components/chat-bot.vue'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import { useJobs } from '~/composables/use-jobs'


const route = useRoute()
const router = useRouter()
const jobIdParam = route.params.id
const jobId = Array.isArray(jobIdParam) ? jobIdParam[0] : jobIdParam

const { selectedJob, fetchJobById } = useJobs()

const isLoading = ref(true)
const isChatBotOpen = ref(false)

const openChatBot = () => {
    isChatBotOpen.value = true
}

const goBack = () => {
    router.back()
}

onMounted(async () => {
    try {
        if (!selectedJob.value || selectedJob.value.job_id !== jobId) {
            isLoading.value = true
            await fetchJobById(jobId)
        }
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <div class="max-w-7xl sm:w-4/5 mx-auto my-6 relative">
        <div v-if="isLoading" class="flex justify-center items-center h-screen">
            <DotLottieVue style="width: 20rem; height: 20rem;" autoplay loop src="/ai_load.lottie" />
        </div>
        <div v-else>
            <div class="flex flex-col md:flex-row gap-2 mt-5">
                <UButton @click="goBack" color="gray" variant="ghost" class="mb-0 md:mb-4">
                    <UIcon name="i-lucide-arrow-left" class="w-5 h-5 mr-2" />
                    Back
                </UButton>
                <h1 class="text-3xl font-bold mb-6">{{ selectedJob?.job_title }}</h1>
            </div>

            <JobDetail :job="selectedJob!" />
        </div>

        <div class="fixed bottom-2 -right-24 hover:cursor-pointer z-50">
            <UTooltip text="Hi. I'm Jinja. Let me help.">
                <DotLottieVue @click="openChatBot" style="width: 18rem;" autoplay loop src="/ai-bot.lottie" />
            </UTooltip>
        </div>

        <UModal v-model="isChatBotOpen" :ui="{ width: 'w-full sm:max-w-4xl' }">
            <ChatBot :defaultJobTitle="selectedJob?.job_title" :defaultJobDescription="selectedJob?.description" />
        </UModal>
    </div>
</template>
