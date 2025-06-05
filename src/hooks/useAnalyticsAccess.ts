
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAnalyticsAccess() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAnalyticsAccess();
  }, []);

  const checkAnalyticsAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from('usuarios')
        .select('email')
        .eq('id', session.user.id)
        .single();

      setHasAccess(userData?.email === 'silveira.odavid@gmail.com');
    } catch (error) {
      console.error('Erro ao verificar acesso aos analytics:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  return { hasAccess, loading };
}
