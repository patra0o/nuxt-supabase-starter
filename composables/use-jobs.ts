import { ref, computed } from 'vue'
import type { Job } from '~/types/Job'

export function useJobs() {
  const supabase = useSupabaseClient()
  const jobs = ref<Job[]>([])
  const isLoading = ref(false)
  const currentPage = ref(1)
  const pageSize = 10
  const totalJobs = ref(0)

  const searchQuery = ref('')
  const selectedCompanies = ref<string[]>([])
  const selectedEmploymentTypes = ref<string[]>([])
  const selectedStatuses = ref<string[]>([])
  const selectedNotifications = ref<string[]>([])
  const selectedRegions = ref<string[]>([])
  const dateRange = ref<{ start: string | null; end: string | null }>({ start: null, end: null })

  const fetchJobs = async (page: number = 1) => {
    try {
      isLoading.value = true
      currentPage.value = page

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase.from('jobs_archive').select('*', { count: 'exact' }).range(from, to)

      // Apply search query
      if (searchQuery.value) {
        query = query.or(`job_title.ilike.%${searchQuery.value}%,description.ilike.%${searchQuery.value}%`)
      }

      // Apply filters
      if (selectedEmploymentTypes.value.length > 0) {
        query = query.in('employment_type', selectedEmploymentTypes.value)
      }
      if (selectedStatuses.value.length > 0) {
        query = query.in('employment_status', selectedStatuses.value)
      }
      if (selectedNotifications.value.length > 0) {
        query = query.in('type_of_notification', selectedNotifications.value)
      }
      if (selectedRegions.value.length > 0) {
        query = query.in('region', selectedRegions.value)
      }
      if (selectedCompanies.value.length > 0) {
        query = query.in('company', selectedCompanies.value)
      }

      // Apply date range filter
      if (dateRange.value.start && dateRange.value.end) {
        query = query.gte('posted_date', dateRange.value.start).lte('posted_date', dateRange.value.end)
      } else if (dateRange.value.start) {
        query = query.gte('posted_date', dateRange.value.start)
      } else if (dateRange.value.end) {
        query = query.lte('posted_date', dateRange.value.end)
      }

      const { data, error, count } = await query

      if (error) throw error

      jobs.value = data || []
      totalJobs.value = count || 0
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      isLoading.value = false
    }
  }

  const totalPages = computed(() => Math.ceil(totalJobs.value / pageSize))

  return {
    jobs,
    isLoading,
    currentPage,
    totalPages,
    fetchJobs,
    searchQuery,
    dateRange,
    selectedEmploymentTypes,
    selectedStatuses,
    selectedNotifications,
    selectedRegions,
    selectedCompanies  
  }
}
