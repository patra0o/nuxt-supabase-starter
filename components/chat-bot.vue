<template>
    <div class="flex flex-col h-full">
        <!-- Chat Messages Section -->
        <div class="flex-1 overflow-y-auto space-y-4">
            <template v-for="(message, index) in messages" :key="index">
                <div :class="[
                    'max-w-3/4 rounded-lg p-8 break-words',
                    message.sender === 'user'
                        ? 'bg-blue-100 dark:bg-blue-700 text-blue-900 dark:text-blue-100 ml-auto'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                ]" v-html="renderMarkdown(message.content)" id="markdown-content">
                </div>
            </template>
        </div>

        <!-- Input Section -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <form @submit.prevent="sendMessage" class="flex space-x-2 items-center">
                <!-- Text Area Input -->
                <UTextarea v-model="userInput" placeholder="Type your message..."
                    class="flex-grow dark:bg-gray-700 dark:text-gray-100" :rows="2" />

                <!-- Send Button with Icon -->
                <UButton type="submit" color="primary" :loading="isLoading" class="p-2">
                    <UIcon name="i-lucide-send-horizontal" class="w-6 h-6 " />
                </UButton>
            </form>
        </div>
    </div>
</template>


<script setup>
import { marked } from 'marked'

const props = defineProps({
    defaultJobTitle: {
        type: String,
        required: true,
    },
    defaultJobDescription: {
        type: String,
        required: true,
    }
})

const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)

const renderMarkdown = (content) => {
    return marked(content)
}

const initializeChat = async () => {
    isLoading.value = true
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `I'm preparing for an interview for the position of ${props.defaultJobTitle}. 
        The job description is: ${props.defaultJobDescription}. 
        Can you provide me with some interview preparation tips?`
            }),
        })
        const data = await response.json()

        // Push AI response including tips and resources
        messages.value.push({
            sender: 'ai',
            content: data.message,
        })
    } catch (error) {
        console.error('Error initializing chat:', error)
        messages.value.push({ sender: 'ai', content: 'Sorry, I encountered an error. Please try again.' })
    } finally {
        isLoading.value = false
    }
}

const sendMessage = async () => {
    if (!userInput.value.trim() || isLoading.value) return

    messages.value.push({ sender: 'user', content: userInput.value })
    const currentUserInput = userInput.value
    userInput.value = ''
    isLoading.value = true

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: currentUserInput }),
        })
        const data = await response.json()

        messages.value.push({
            sender: 'ai',
            content: data.message,
        })
    } catch (error) {
        console.error('Error sending message:', error)
        messages.value.push({ sender: 'ai', content: 'Sorry, I encountered an error. Please try again.' })
    } finally {
        isLoading.value = false
    }
}

onMounted(initializeChat)
</script>

<style>
#markdown-content>p {
    margin-bottom: 1rem;
}

#markdown-content>ul li {
    margin-bottom: .7rem;
}
</style>