import { supabase } from "api/supabase";
import { useAuthStore } from "store/authStore";

export const initAuth = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        return;
    }

    useAuthStore.getState().setUser({
        id: data.user.id,
        email: data.user.email,
    });
};