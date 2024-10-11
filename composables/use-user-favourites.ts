import { ref, onMounted, onUnmounted } from 'vue'
import { useSupabaseClient } from '#imports'

export function useUserFavourites() {
  const supabase = useSupabaseClient()
  const { user } = useUser()
  const favourites = ref<string[]>([])
  const isLoading = ref(true)

  const fetchFavourites = async () => {
    if (!user.value) return

    const { data, error } = await supabase
      .from('user_favourites')
      .select('job_id')
      .eq('user_id', user.value.id)

    if (error) {
      console.error('Error fetching favourites:', error)
      return
    }

    favourites.value = data.map(fav => fav.job_id)
    isLoading.value = false
  }

  const addFavourite = async (jobId: string) => {
    if (!user.value) return

    const { error } = await supabase
      .from('user_favourites')
      .insert({ user_id: user.value.id, job_id: jobId })

    if (error) {
      console.error('Error adding favorite:', error)
      return
    }

    favourites.value.push(jobId)
  }

  const removeFavourite = async (jobId: string) => {
    if (!user.value) return

    const { error } = await supabase
      .from('user_favourites')
      .delete()
      .eq('user_id', user.value.id)
      .eq('job_id', jobId)

    if (error) {
      console.error('Error removing favorite:', error)
      return
    }

    favourites.value = favourites.value.filter(id => id !== jobId)
  }

  const isFavourite = (jobId: string) => favourites.value.includes(jobId)

  let subscription: any

  onMounted(() => {
    fetchFavourites()

     subscription = supabase
      .channel('user_favourites_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_favourites',
          filter: `user_id=eq.${user.value?.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newFavorite = payload.new as { job_id: string }
            if (!favourites.value.includes(newFavorite.job_id)) {
              favourites.value.push(newFavorite.job_id)
            }
          } else if (payload.eventType === 'DELETE') {
            const removedFavorite = payload.old as { job_id: string }
            favourites.value = favourites.value.filter(id => id !== removedFavorite.job_id)
          }
        }
      )
      .subscribe()
  })

  onUnmounted(() => {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  })

  return {
    favourites,
    isLoading,
    fetchFavourites,
    addFavourite,
    removeFavourite,
    isFavourite
  }
}