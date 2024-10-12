import { ref, onMounted } from 'vue'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const loading = ref(true)

export function useUser() {
  const tokenKey = 'sb-ybbvdbffldxjflvmuqrz-auth-token'
  const fetchUserFromLocalStorage = () => {
    const tokenString = localStorage.getItem(tokenKey)

    if (tokenString) {
      try {
        const token = JSON.parse(tokenString)

        if (token?.user) {
          user.value = token.user
        } else {
          console.error('No user found in token')
          user.value = null
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
        user.value = null
      }
    } else {
      console.error('No auth token found in localStorage')
      user.value = null
    }

    loading.value = false
  }

  const signOut = () => {
    localStorage.removeItem(tokenKey)
    user.value = null
  }

  onMounted(() => {
    fetchUserFromLocalStorage()
  })

  return {
    user,
    loading,
    fetchUserFromLocalStorage,
    signOut,
  }
}
