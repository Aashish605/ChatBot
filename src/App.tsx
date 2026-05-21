import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';
import { SupabaseProvider as AuthProvider } from 'contexts/SupabaseContext';
import { useAuthStore } from 'store/authStore';
import { useEffect } from 'react';
import { initAuth } from 'utils/initAuth';
import { supabase } from 'api/supabase';


// auth-provider
// import { FirebaseProvider as AuthProvider } from 'contexts/FirebaseContext';
// import { Auth0Provider as AuthProvider } from 'contexts/Auth0Context';
// import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
// import { SupabaseProvider as AuthProvider } from 'contexts/SupabaseContext';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
        });
      } else {
        clearUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  return (
    <>
      <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <ScrollTop>
              <AuthProvider>
                <>
                  <Notistack>
                    <RouterProvider router={router} />
                    <Snackbar />
                  </Notistack>
                </>
              </AuthProvider>
            </ScrollTop>
          </Locales>
        </RTLLayout>
      </ThemeCustomization>
    </>
  );
}
