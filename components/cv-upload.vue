<template>
  <div>
    <UCard class="mb-4">
      <h2 class="text-xl font-semibold mb-4">Upload Your CV</h2>
      <div @dragover.prevent @drop.prevent="handleFileDrop"
        class="border-dashed border-2 border-gray-300 rounded-lg p-8 h-[30vh] text-center cursor-pointer transition-colors flex justify-center items-center"
        :class="{ 'opacity-50 cursor-not-allowed': !!existingCv }" @click="!existingCv && $refs.fileInput.click()">
        <div>
          <UIcon v-if="!uploadedFile" name="i-lucide-upload-cloud" class="text-4xl mb-2 text-gray-400" />
          <p v-if="!uploadedFile" class="text-gray-500">
            {{ existingCv ? 'Delete CV to upload a new one' : 'Drag and drop your CV here, or click to select a file' }}
          </p>
          <p v-else class="text-green-600 font-semibold">{{ uploadedFile.name }}</p>
        </div>
        <input type="file" accept=".pdf" @change="handleFileChange" class="hidden" ref="fileInput"
          :disabled="!!existingCv" />
      </div>
      <UButton class="mt-4 w-full" color="primary" @click="uploadCV" :loading="uploading"
        :disabled="!uploadedFile || !!existingCv">
        {{ uploadedFile ? 'Upload CV' : 'Select a PDF file' }}
      </UButton>
    </UCard>

    <UCard v-if="existingCv" class="mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <UIcon name="i-lucide-file-text" class="text-2xl mr-2" />
          <span class="font-semibold">{{ existingCv.name }}</span>
        </div>
        <div>
          <UButton color="primary" class="mr-2" @click="downloadCV">
            <UIcon name="i-lucide-download" />
          </UButton>
          <UButton color="red" @click="deleteCV" :loading="deleting">
            <UIcon name="i-lucide-trash-2" />
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const toast = useToast()

const uploadedFile = ref<File | null>(null)
const uploading = ref(false)
const deleting = ref(false)
const existingCv = ref<{ name: string; url: string } | null>(null)
const supabase = useSupabaseClient()
const user = useUser().user

onMounted(async () => {
  await checkExistingCV()
})

const checkExistingCV = async () => {
  try {
    const { data, error } = await supabase
      .storage
      .from('span')
      .list(`resumes/${user.value!.id}`)

    if (error) throw error

    if (data && data.length > 0) {
      const { data: urlData } = await supabase
        .storage
        .from('span')
        .getPublicUrl(`resumes/${user.value!.id}/${data[0].name}`)

      existingCv.value = {
        name: data[0].name,
        url: urlData.publicUrl
      }
    } else {
      existingCv.value = null
    }
  } catch (error) {
    toast.add({ color: "red", title: "Error checking existing CV:, error" })
  }
}

const handleFileDrop = (event: DragEvent) => {
  if (existingCv.value) return
  const file = event.dataTransfer?.files[0]
  if (file && file.type === 'application/pdf') {
    uploadedFile.value = file
  } else {
    toast.add({ color: "red", title: "Please upload a valid PDF file." })
  }
}

const handleFileChange = (event: Event) => {
  if (existingCv.value) return
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type === 'application/pdf') {
    uploadedFile.value = file
  } else {
    toast.add({ color: "red", title: "Please upload a valid PDF file." })
  }
}

const uploadCV = async () => {
  if (!uploadedFile.value || existingCv.value) return
  uploading.value = true
  try {
    const { data, error } = await supabase
      .storage
      .from('span')
      .upload(`resumes/${user.value!.id}/${uploadedFile.value.name}`, uploadedFile.value, {
        cacheControl: '3600',
        upsert: false,
      })
    if (error) throw error

    toast.add({ color: "green", title: "CV uploaded successfully." })
    await checkExistingCV()
    uploadedFile.value = null

    await updateUserProfile(user.value!.id)

  } catch (error) {
    toast.add({ color: "red", title: "Error uploading CV." })
  } finally {
    uploading.value = false
  }
}

const deleteCV = async () => {
  if (!existingCv.value) return
  deleting.value = true
  try {
    const { error } = await supabase
      .storage
      .from('span')
      .remove([`resumes/${user.value!.id}/${existingCv.value.name}`])

    if (error) throw error

    existingCv.value = null
    await checkExistingCV()
    toast.add({ color: "green", title: "CV deleted successfully." })
  } catch (error) {
    toast.add({ color: "red", title: "Error deleting CV." })
  } finally {
    deleting.value = false
  }
}

const downloadCV = () => {
  if (existingCv.value) {
    window.open(existingCv.value.url, '_blank')
  }
}

const updateUserProfile = async (userId: string) => {
  try {
    const { data, error } = await useFetch('/api/aiUpdateProfile', {
      method: 'POST',
      body: { user_id: userId },
    })

    if (error.value) {
      throw error.value
    }

    toast.add({ color: "green", title: "User profile updated successfully." })
  } catch (error) {
    console.error("Failed to update profile: ", error)
    toast.add({ color: "red", title: "Failed to update user profile." })
  }
}
</script>
