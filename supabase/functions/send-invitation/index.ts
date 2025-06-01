
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  email: string;
  nome: string;
  permissao: string;
  permissions: any;
  empresa_nome: string;
  invited_by_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const { email, nome, permissao, permissions, empresa_nome, invited_by_name }: InvitationRequest = await req.json();

    // Verificar se já existe colaborador com este email
    const { data: existingColaborador } = await supabaseClient
      .from('colaboradores')
      .select('id, status')
      .eq('email', email)
      .single();

    if (existingColaborador && existingColaborador.status === 'ativo') {
      return new Response(
        JSON.stringify({ error: 'Este email já possui um convite ativo' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Obter auth user para invited_by
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Criar ou atualizar colaborador
    const invite_token = crypto.randomUUID();
    const invite_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dias

    let colaboradorId;

    if (existingColaborador) {
      // Atualizar convite existente
      const { data, error } = await supabaseClient
        .from('colaboradores')
        .update({
          nome,
          permissao,
          permissions,
          invite_token,
          invite_expires_at,
          invited_by: user.id,
          status: 'pendente'
        })
        .eq('id', existingColaborador.id)
        .select('id')
        .single();

      if (error) throw error;
      colaboradorId = data.id;
    } else {
      // Criar novo colaborador
      const { data, error } = await supabaseClient
        .from('colaboradores')
        .insert({
          email,
          nome,
          permissao,
          permissions,
          empresa_nome,
          empresa_id: user.id,
          invite_token,
          invite_expires_at,
          invited_by: user.id,
          status: 'pendente'
        })
        .select('id')
        .single();

      if (error) throw error;
      colaboradorId = data.id;
    }

    // Enviar email de convite
    const inviteUrl = `${req.headers.get('origin')}/convite/aceitar?token=${invite_token}`;
    
    const roleNames = {
      'admin': 'Administrador',
      'editar': 'Editor',
      'visualizar': 'Visualizador'
    };

    const emailResponse = await resend.emails.send({
      from: `${empresa_nome} <convites@medikran.app>`,
      to: [email],
      subject: `Convite para colaborar na ${empresa_nome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0891b2; font-size: 28px; margin: 0;">Medikran</h1>
            <p style="color: #64748b; font-size: 16px; margin: 5px 0;">Sistema de Análise Craniana</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 20px 0;">Você foi convidado!</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              Olá <strong>${nome}</strong>,
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              <strong>${invited_by_name}</strong> convidou você para colaborar na clínica <strong>${empresa_nome}</strong> 
              com o cargo de <strong>${roleNames[permissao as keyof typeof roleNames] || permissao}</strong>.
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
              Com o Medikran, você poderá realizar análises cranianas precisas, acompanhar o desenvolvimento dos pacientes 
              e gerar relatórios detalhados.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="background: #0891b2; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block;">
                Aceitar Convite
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
              Este convite expira em 7 dias. Se você não conseguir clicar no botão, 
              copie e cole este link no seu navegador:
            </p>
            <p style="color: #0891b2; font-size: 14px; word-break: break-all; text-align: center; margin: 10px 0;">
              ${inviteUrl}
            </p>
          </div>
          
          <div style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px;">
            <p>Este email foi enviado pela ${empresa_nome} através do Medikran.</p>
            <p>Se você não esperava este convite, pode ignorar este email com segurança.</p>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    // Log da ação
    await supabaseClient
      .from('collaborator_audit_logs')
      .insert({
        user_id: user.id,
        collaborator_id: colaboradorId,
        action: 'invitation_sent',
        details: { 
          email, 
          permissao, 
          invited_by_name,
          expires_at: invite_expires_at 
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Convite enviado com sucesso!',
        colaborador_id: colaboradorId 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-invitation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
