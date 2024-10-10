import { ref, onMounted } from 'vue';
 import type { User } from '@supabase/supabase-js'; // Import the User type from Supabase

const user = ref<User | null>(null);
const loading = ref(true);  

export function useUser() {
  const supabase = useSupabaseClient();  
  const fetchUser = async () => {
    loading.value = true;

     const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.error('Error fetching session or no session exists:', error);
      user.value = null;
    } else {
       user.value = session.user;
    }

    loading.value = false;
  };

   const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error during sign out:', error.message);
    }

     user.value = null;
  };
   onMounted(fetchUser);

   return {
    user,
    loading,
    fetchUser,
    signOut,
  };
}
