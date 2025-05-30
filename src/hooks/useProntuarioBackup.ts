
import { useEffect, useCallback } from 'react';
import { Prontuario } from '@/types';

interface ProntuarioFormData {
  [key: string]: any;
}

export const useProntuarioBackup = (prontuarioId: string | undefined) => {
  const getBackupKey = useCallback((field: string) => {
    return `prontuario_backup_${prontuarioId}_${field}`;
  }, [prontuarioId]);

  const saveToBackup = useCallback((field: string, value: any) => {
    if (!prontuarioId) return;
    
    try {
      const key = getBackupKey(field);
      localStorage.setItem(key, JSON.stringify({
        value,
        timestamp: Date.now()
      }));
      console.log(`Backup salvo para ${field}:`, value);
    } catch (error) {
      console.error('Erro ao salvar backup:', error);
    }
  }, [prontuarioId, getBackupKey]);

  const loadFromBackup = useCallback((field: string) => {
    if (!prontuarioId) return null;
    
    try {
      const key = getBackupKey(field);
      const backup = localStorage.getItem(key);
      if (backup) {
        const parsed = JSON.parse(backup);
        console.log(`Backup recuperado para ${field}:`, parsed.value);
        return parsed.value;
      }
    } catch (error) {
      console.error('Erro ao carregar backup:', error);
    }
    return null;
  }, [prontuarioId, getBackupKey]);

  const clearBackup = useCallback((field: string) => {
    if (!prontuarioId) return;
    
    try {
      const key = getBackupKey(field);
      localStorage.removeItem(key);
      console.log(`Backup removido para ${field}`);
    } catch (error) {
      console.error('Erro ao remover backup:', error);
    }
  }, [prontuarioId, getBackupKey]);

  const clearAllBackups = useCallback(() => {
    if (!prontuarioId) return;
    
    const fields = ['conduta', 'atestado', 'diagnostico', 'cid', 'queixa_principal', 'idade_gestacional', 'idade_corrigida', 'observacoes_anamnese', 'avaliacao'];
    fields.forEach(field => clearBackup(field));
    console.log('Todos os backups foram removidos');
  }, [prontuarioId, clearBackup]);

  return {
    saveToBackup,
    loadFromBackup,
    clearBackup,
    clearAllBackups
  };
};
