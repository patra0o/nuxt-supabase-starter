<script setup lang="ts">
import { signUpValidation, type SchemaSignUpValidation } from '~/utils/formValidation'
import type { FormSubmitEvent } from '#ui/types'
import { BaseError, useErrorHandler } from '~/composables/use-error-handler'

definePageMeta({
  middleware: 'guest'
})

useSeoMeta({
  title: 'Sign Up - Tulongeni',
})

const { auth, from } = useSupabaseClient()
const supabase: any = useSupabaseClient()
const { errorHandler } = useErrorHandler()
const toast = useToast()

const form = reactive({
  email: undefined,
  password: undefined,
  first_name: '',
  last_name: '',
  display_name: ''
})

const isLoading = ref(false)

/**
 * Sign up with credential.
 *
 * @param {FormSubmitEvent<SchemaSignUpValidation>} event - The form submit event.
 * @return {Promise<void>} A promise that resolves when the sign-up process is completed.
 */
const signUpWithCredential = async (event: FormSubmitEvent<SchemaSignUpValidation>) => {
  try {
    isLoading.value = true

    const { data: signUp, error: signUpError } = await auth.signUp({
      email: form.email ?? '',
      password: form.password ?? ''
    })

    if (signUpError || !signUp.user) {
      throw new BaseError(signUpError?.status, signUpError!.message)
    }

    // Profile creation step
    const { error: profileError } = await supabase.from('user_profiles').insert({
      user_id: signUp.user.id,
      first_name: form.first_name,
      last_name: form.last_name,
      display_name: form.display_name,
    })

    if (profileError) {
      throw new BaseError(profileError.code, profileError.message)
    }

    toast.add({
      title: 'Sign Up Successful',
      description: 'A confirmation email has been sent to your email address.',
      icon: 'i-heroicons-check-circle',
      color: 'green',
    })

    setTimeout(() => {
      navigateTo('/dashboard')
    }, 5000)

    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    errorHandler(error as BaseError)
  }
}


/**
 * Sign up with the specified provider.
 *
 * @param {string} provider - The provider to sign up with (either 'GITHUB' or 'GOOGLE').
 * @return {Promise<void>} A promise that resolves when the sign-up process is complete.
 */
const signUpWithProvider = async (provider: 'GITHUB' | 'GOOGLE') => {
  try {
    isLoading.value = true

    let signUp = null

    if (provider === 'GITHUB') {
      signUp = await auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/confirm`
        }
      })
    }

    if (signUp?.error) {
      isLoading.value = false
      throw new BaseError(signUp.error.status, signUp.error.message)
    }

    navigateTo('/dashboard')
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    errorHandler(error as BaseError)
  }
}
</script>

<template>
  <div>
    <div class="container mx-auto">
      <div class="flex h-[100vh] w-full justify-center items-center">
        <div class="w-10/12 md:w-8/12 lg:w-4/12 xl:w-3/12">
          <UCard>
            <UForm :schema="signUpValidation" :state="form" class="space-y-2" @submit="signUpWithCredential">
              <div class="space-y-4">

                <p class="text-lg font-bold text-center">Create an account, today.</p>

                <UFormGroup label="First Name" name="first_name">
                  <UInput v-model="form.first_name" />
                </UFormGroup>

                <UFormGroup label="Last Name" name="last_name">
                  <UInput v-model="form.last_name" />
                </UFormGroup>

                <UFormGroup label="Display Name" name="display_name">
                  <UInput v-model="form.display_name" />
                </UFormGroup>

                <UFormGroup label="Email" name="email">
                  <UInput v-model="form.email" />
                </UFormGroup>

                <UFormGroup label="Password" name="password">
                  <UInput v-model="form.password" type="password" />
                </UFormGroup>

                <UButton :loading="isLoading" :disabled="isLoading" type="submit" label="Register" color="gray" block />
              </div>
              <!-- <UDivider label="or" color="gray" orientation="vertical" /> -->

              <!-- <div class="space-y-4 flex flex-col justify-center">
                <UButton @click="signUpWithProvider('GITHUB')" :disabled="isLoading" color="black"
                  label="Continue with GitHub" icon="i-lucide-github" block />
              </div> -->
            </UForm>
          </UCard>

          <div class="flex items-center gap-2 justify-center mt-3">
            <p class="opacity-50">Already have an account?</p>
            <NuxtLink to="/sign-in" class="underline">Sign in</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
