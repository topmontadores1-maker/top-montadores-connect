/**
 * Audit helpers - Log user actions automatically
 */

import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/integrations/supabase/auth-store';

/**
 * Create an audit log entry
 * @param action - What happened (e.g., "Criou montador")
 * @param target - What was affected (e.g., "Carlos Silva")
 */
export async function logAction(action: string, target: string) {
  try {
    const user = useSupabaseAuth.getState().user;
    
    if (!user) {
      console.warn('Cannot audit: no authenticated user');
      return;
    }

    await supabase.from('audit_logs').insert({
      action,
      target,
      user_id: user.id,
      ip_address: null, // Could be added via function
    });
  } catch (error) {
    console.error('Error logging action:', error);
    // Don't throw - audit failures shouldn't break the app
  }
}

/**
 * Log common actions
 */
export const auditActions = {
  // Professionals
  createProfessional: (name: string) => 
    logAction('Cadastrou montador', name),
  
  updateProfessional: (name: string, field: string) => 
    logAction(`Atualizou ${field}`, name),
  
  deleteProfessional: (name: string) => 
    logAction('Deletou montador', name),
  
  pauseProfessional: (name: string) => 
    logAction('Pausou montador', name),
  
  resumeProfessional: (name: string) => 
    logAction('Reativou montador', name),
  
  // Services
  createService: (name: string) => 
    logAction('Criou serviço', name),

  updateService: (name: string) =>
    logAction('Atualizou serviço', name),
  
  deleteService: (name: string) => 
    logAction('Deletou serviço', name),
  
  // Links
  createLink: (service: string, city: string) => 
    logAction('Criou link', `${service} em ${city}`),
  
  deleteLink: (service: string, city: string) => 
    logAction('Deletou link', `${service} em ${city}`),
  
  // Batch operations
  bulkUpdate: (count: number, field: string) => 
    logAction(`Atualizou ${count} registros`, `Campo: ${field}`),
  
  // Imports
  importData: (filename: string, rows: number) => 
    logAction('Importou planilha', `${filename} (${rows} linhas)`),
};
