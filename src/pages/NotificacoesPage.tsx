import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, BellOff, AlertTriangle, FileText, UserPlus, CalendarCheck2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { RealNotificacao } from "@/components/Header"; // Importar a interface do Header
import { getCranialStatus, SeverityLevel } from "@/lib/cranial-utils";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const NOTIFICACOES_LIDAS_STORAGE_KEY = "craniumCareNotificacoesLidas";
const ULTIMA_VERIFICACAO_STORAGE_KEY = "craniumCareUltimaVerificacaoNotificacoes";

// Função para buscar notificações reais (similar à do Header.tsx, mas pode ser movida para um hook/serviço)
const fetchNotificacoesReais = async (): Promise<RealNotificacao[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  let todasAsNotificacoes: RealNotificacao[] = [];
  const agora = new Date();
  const ultimaVerificacaoString = localStorage.getItem(ULTIMA_VERIFICACAO_STORAGE_KEY);
  // Para a página de todas as notificações, talvez buscar um período maior ou todas não lidas + recentes lidas
  const ultimaVerificacao = ultimaVerificacaoString ? new Date(ultimaVerificacaoString) : new Date(agora.getTime() - 24 * 60 * 60 * 1000 * 30); // Padrão: últimos 30 dias para a página completa

  // 1. Novos Pacientes
  try {
    const { data: novosPacientes, error: errPacientes } = await supabase
      .from("pacientes")
      .select("id, nome, created_at")
      .gt("created_at", ultimaVerificacao.toISOString())
      .order("created_at", { ascending: false });

    if (errPacientes) console.error("Erro ao buscar novos pacientes (NotificacoesPage):", errPacientes);
    else if (novosPacientes) {
      novosPacientes.forEach(p => {
        todasAsNotificacoes.push({
          id: `paciente-${p.id}`,
          title: "Novo Paciente Registrado",
          message: `O paciente ${p.nome} foi registrado no sistema.`,
          timestamp: new Date(p.created_at),
          read: false,
          type: "novo_paciente",
          link: `/pacientes/${p.id}`,
          urgencia: "media",
          referenciaId: p.id,
        });
      });
    }
  } catch (e) { console.error("Catch novos pacientes (NotificacoesPage):", e); }

  // 2. Novas Medições
  try {
    const { data: novasMedicoes, error: errMedicoes } = await supabase
      .from("medicoes")
      .select("id, paciente_id, data, pacientes (nome)")
      .gt("data", ultimaVerificacao.toISOString())
      .order("data", { ascending: false });
    
    if (errMedicoes) console.error("Erro ao buscar novas medições (NotificacoesPage):", errMedicoes);
    else if (novasMedicoes) {
      novasMedicoes.forEach((m: any) => {
        const nomePaciente = m.pacientes?.nome || "Paciente";
        todasAsNotificacoes.push({
          id: `medicao-${m.id}`,
          title: "Nova Medição Registrada",
          message: `Nova medição para ${nomePaciente} em ${new Date(m.data).toLocaleDateString("pt-BR")}.`,
          timestamp: new Date(m.data),
          read: false,
          type: "nova_medicao",
          link: `/pacientes/${m.paciente_id}/medicoes/${m.id}`,
          urgencia: "media",
          referenciaId: m.id,
        });
      });
    }
  } catch (e) { console.error("Catch novas medições (NotificacoesPage):", e); }

  // 3. Tarefas (derivadas de medições para reavaliação)
  try {
      const { data: pacientesComMedicoes, error: errPacMed } = await supabase
          .from('pacientes')
          .select(`id, nome, medicoes (id, data, indice_craniano, cvai)`)
          .order('data', { foreignTable: 'medicoes', ascending: false });

      if (errPacMed) console.error("Erro ao buscar pacientes para tarefas (NotificacoesPage):", errPacMed);
      else if (pacientesComMedicoes) {
          const hoje = new Date();
          const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
          const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

          pacientesComMedicoes.forEach((pac: any) => {
              if (pac.medicoes && pac.medicoes.length > 0) {
                  const ultimaMedicao = pac.medicoes[0];
                  const { severityLevel } = getCranialStatus(ultimaMedicao.indice_craniano || 0, ultimaMedicao.cvai || 0);
                  const dataUltimaMedicao = new Date(ultimaMedicao.data);
                  let proximaAvaliacao = new Date(dataUltimaMedicao);

                  switch(severityLevel) {
                      case 'normal': proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 3); break;
                      case 'leve': proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 2); break;
                      case 'moderada': case 'severa': proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 1); break;
                      default: proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 2);
                  }

                  if (proximaAvaliacao >= inicioHoje && proximaAvaliacao <= fimHoje) {
                      todasAsNotificacoes.push({
                          id: `tarefa-hoje-${pac.id}-${ultimaMedicao.id}`,
                          title: "Tarefa para Hoje",
                          message: `Reavaliação de ${pac.nome} agendada para hoje.`,
                          timestamp: proximaAvaliacao,
                          read: false,
                          type: "tarefa_hoje",
                          link: `/pacientes/${pac.id}`,
                          urgencia: "alta",
                          referenciaId: pac.id,
                      });
                  } else if (proximaAvaliacao < inicioHoje) {
                      const diasAtraso = (inicioHoje.getTime() - proximaAvaliacao.getTime()) / (1000 * 3600 * 24);
                      if (diasAtraso <= 30) { // Aumentar o range para a página de todas as notificações
                          todasAsNotificacoes.push({
                              id: `tarefa-atrasada-${pac.id}-${ultimaMedicao.id}`,
                              title: "Tarefa Atrasada",
                              message: `Reavaliação de ${pac.nome} está atrasada.`,
                              timestamp: proximaAvaliacao,
                              read: false,
                              type: "tarefa_atrasada",
                              link: `/pacientes/${pac.id}`,
                              urgencia: "alta",
                              referenciaId: pac.id,
                          });
                      }
                  }
              }
          });
      }
  } catch (e) { console.error("Catch tarefas (NotificacoesPage):", e); }
  
  // Remover duplicatas pelo ID, caso alguma lógica gere IDs iguais
  const uniqueNotificacoes = Array.from(new Map(todasAsNotificacoes.map(item => [item.id, item])).values());

  uniqueNotificacoes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return uniqueNotificacoes;
};

const getNotificacoesLidas = (): string[] => {
  const lidas = localStorage.getItem(NOTIFICACOES_LIDAS_STORAGE_KEY);
  return lidas ? JSON.parse(lidas) : [];
};

const marcarNotificacaoComoLidaStorage = (id: string) => {
  const lidas = getNotificacoesLidas();
  if (!lidas.includes(id)) {
    localStorage.setItem(NOTIFICACOES_LIDAS_STORAGE_KEY, JSON.stringify([...lidas, id]));
  }
};

const marcarTodasComoLidasStorage = (notifs: RealNotificacao[]) => {
  const todasIds = notifs.map(n => n.id);
  const lidasAtuais = getNotificacoesLidas();
  const novasLidas = Array.from(new Set([...lidasAtuais, ...todasIds]));
  localStorage.setItem(NOTIFICACOES_LIDAS_STORAGE_KEY, JSON.stringify(novasLidas));
};

const limparNotificacoesLidasStorage = (notifs: RealNotificacao[]) => {
    const idsNaoLidas = notifs.filter(n => !n.read).map(n => n.id);
    localStorage.setItem(NOTIFICACOES_LIDAS_STORAGE_KEY, JSON.stringify(idsNaoLidas));
};

export function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<RealNotificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  const carregarNotificacoes = useCallback(async () => {
    setCarregando(true);
    const notificacoesReais = await fetchNotificacoesReais();
    const lidasIds = getNotificacoesLidas();
    const notificacoesComStatusLida = notificacoesReais.map(n => ({
      ...n,
      read: lidasIds.includes(n.id)
    }));
    setNotificacoes(notificacoesComStatusLida);
    localStorage.setItem(ULTIMA_VERIFICACAO_STORAGE_KEY, new Date().toISOString()); // Atualiza a última verificação
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregarNotificacoes();
  }, [carregarNotificacoes]);

  const marcarComoLida = (id: string) => {
    marcarNotificacaoComoLidaStorage(id);
    setNotificacoes(prevNotificacoes =>
      prevNotificacoes.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const marcarTodasComoLidas = () => {
    marcarTodasComoLidasStorage(notificacoes);
    setNotificacoes(prevNotificacoes =>
      prevNotificacoes.map(n => ({ ...n, read: true }))
    );
  };

  const limparNotificacoesLidas = () => {
    limparNotificacoesLidasStorage(notificacoes);
    setNotificacoes(prevNotificacoes => prevNotificacoes.filter(n => !n.read));
  };

  const todasLidas = notificacoes.every(n => n.read);
  const naoLidasCount = notificacoes.filter(n => !n.read).length;

  const getIconForType = (type: RealNotificacao['type']) => {
    switch (type) {
      case 'novo_paciente': return <UserPlus className="h-5 w-5 mr-3 text-blue-500" />;
      case 'nova_medicao': return <FileText className="h-5 w-5 mr-3 text-green-500" />;
      case 'tarefa_hoje': return <CalendarCheck2 className="h-5 w-5 mr-3 text-orange-500" />;
      case 'tarefa_atrasada': return <AlertTriangle className="h-5 w-5 mr-3 text-red-500" />;
      default: return <BellOff className="h-5 w-5 mr-3 text-gray-400" />;
    }
  };
  
  const formatarTempoNotificacao = (timestamp: Date): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 animate-fade-in">
      <Card className="bg-card shadow-xl rounded-lg border">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-semibold text-card-foreground">Todas as Notificações</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={marcarTodasComoLidas}
                disabled={naoLidasCount === 0}
              >
                <Check className="mr-2 h-4 w-4" /> Marcar todas como lidas
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={limparNotificacoesLidas}
                disabled={notificacoes.filter(n => n.read).length === 0}
              >
                <BellOff className="mr-2 h-4 w-4" /> Limpar lidas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {carregando ? (
            <div className="p-10 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">Carregando notificações...</p>
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <BellOff className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-lg">Você não tem nenhuma notificação no momento.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notificacoes.map(notificacao => (
                <li 
                  key={notificacao.id} 
                  className={cn(
                    "p-4 transition-colors duration-150 flex items-start",
                    notificacao.read ? "bg-card hover:bg-muted/30" : "bg-primary/10 hover:bg-primary/20 font-medium",
                    notificacao.link && "cursor-pointer"
                  )}
                  onClick={() => {
                    if (!notificacao.read) marcarComoLida(notificacao.id);
                    if (notificacao.link) navigate(notificacao.link);
                  }}
                >
                  {getIconForType(notificacao.type)}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <h3 className={cn(
                            "text-md",
                            !notificacao.read ? "text-primary" : "text-card-foreground"
                        )}>
                            {notificacao.title}
                        </h3>
                        {!notificacao.read && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => { 
                                    e.stopPropagation(); // Evita que o clique na li seja acionado também
                                    marcarComoLida(notificacao.id); 
                                }}
                                className="text-xs text-primary hover:text-primary/80 px-2 py-1 h-auto"
                            >
                                <Check className="mr-1 h-3 w-3" /> Marcar como lida
                            </Button>
                        )}
                    </div> 
                    <p className="text-sm text-muted-foreground mt-1">{notificacao.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatarTempoNotificacao(notificacao.timestamp)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

