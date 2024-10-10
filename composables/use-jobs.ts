import { ref, computed } from "vue";
 
import type { Job } from "~/types/Job";

export function useJobs() {
  const supabase = useSupabaseClient();
  const { user } = useUser(); // Get the current user from the user composable
  const jobs = ref<Job[]>([]);
  const isLoading = ref(false);
  const currentPage = ref(1);
  const pageSize = 10;
  const totalJobs = ref(0);

  const searchQuery = ref('');
  const selectedCompanies = ref<{ label: string; value: string }[]>([]);
  const selectedEmploymentTypes = ref<string[]>([]);
  const selectedStatuses = ref<string[]>([]);
  const selectedNotifications = ref<string[]>([]);
  const selectedRegions = ref<string[]>([]);
  const dateRange = ref<{ start: string | null; end: string | null }>({ start: null, end: null });
  const companyOptions = ref<{ label: string; value: string }[]>([]);

  const selectedJob = ref<Job | null>(null);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('lu_companies')
        .select('company');

      if (error) throw error;

      companyOptions.value = data.map((item) => ({
        label: item.company,
        value: item.company,
      }));
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

   
  const fetchJobs = async (page: number = 1) => {
    try {
      isLoading.value = true;
      currentPage.value = page;
  
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
  
      let query = supabase
        .from('jobs_archive')
        .select('*', { count: 'exact' })
        .range(from, to);
  
       if (selectedCompanies.value.length > 0) {
        const companyValues = selectedCompanies.value.map(company => company.value);
        query = query.in('company', companyValues);
      }
  
       const { data, error, count } = await query;
  
      if (error) throw error;
 jobs.value = data;
      totalJobs.value = count || 0;
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      isLoading.value = false;
    }
  };
  

  const fetchJobById = async (jobId: string) => {
    try {
      isLoading.value = true;
      const { data, error } = await supabase
        .from('jobs_archive')
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (error) throw error;
      selectedJob.value = data;
    } catch (error) {
      console.error('Error fetching job by ID:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const totalPages = computed(() => Math.ceil(totalJobs.value / pageSize));

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
    selectedCompanies,
    companyOptions,
    fetchCompanies,
    selectedJob,
    fetchJobById,
  };
}
