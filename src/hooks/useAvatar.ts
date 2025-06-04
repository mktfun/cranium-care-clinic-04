
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AvatarState {
  avatarUrl: string | null;
  loading: boolean;
}

// Estado global para o avatar
let globalAvatarState: AvatarState = {
  avatarUrl: null,
  loading: false
};

const avatarListeners: Array<(state: AvatarState) => void> = [];

export const useAvatar = () => {
  const [state, setState] = useState<AvatarState>(globalAvatarState);

  useEffect(() => {
    // Adicionar listener
    avatarListeners.push(setState);
    
    // Carregar avatar inicial se não estiver carregado
    if (!globalAvatarState.avatarUrl && !globalAvatarState.loading) {
      loadAvatar();
    }

    // Cleanup
    return () => {
      const index = avatarListeners.indexOf(setState);
      if (index > -1) {
        avatarListeners.splice(index, 1);
      }
    };
  }, []);

  const notifyListeners = (newState: AvatarState) => {
    globalAvatarState = newState;
    avatarListeners.forEach(listener => listener(newState));
  };

  const loadAvatar = async () => {
    try {
      notifyListeners({ ...globalAvatarState, loading: true });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        notifyListeners({ avatarUrl: null, loading: false });
        return;
      }

      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('avatar_url')
        .eq('id', session.user.id)
        .single();

      notifyListeners({ 
        avatarUrl: usuarioData?.avatar_url || null, 
        loading: false 
      });
    } catch (error) {
      console.error('Erro ao carregar avatar:', error);
      notifyListeners({ avatarUrl: null, loading: false });
    }
  };

  const updateAvatar = async (file: File): Promise<{ success: boolean; error?: string }> => {
    try {
      notifyListeners({ ...globalAvatarState, loading: true });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        notifyListeners({ ...globalAvatarState, loading: false });
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Upload do arquivo usando a estrutura de pastas por usuário
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ avatar_url: avatarUrl })
        .eq('id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado global
      notifyListeners({ avatarUrl, loading: false });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar avatar:', error);
      notifyListeners({ ...globalAvatarState, loading: false });
      return { success: false, error: error.message };
    }
  };

  const removeAvatar = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      notifyListeners({ ...globalAvatarState, loading: true });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        notifyListeners({ ...globalAvatarState, loading: false });
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ avatar_url: null })
        .eq('id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado global
      notifyListeners({ avatarUrl: null, loading: false });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao remover avatar:', error);
      notifyListeners({ ...globalAvatarState, loading: false });
      return { success: false, error: error.message };
    }
  };

  return {
    avatarUrl: state.avatarUrl,
    loading: state.loading,
    updateAvatar,
    removeAvatar,
    reloadAvatar: loadAvatar
  };
};
