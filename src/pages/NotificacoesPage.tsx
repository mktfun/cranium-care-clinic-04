import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

// Definindo a interface Notificacao aqui também para consistência
interface Notificacao {
  id: string; // Mudei para string para IDs únicos mais robustos (ex: UUID)
  title: string;
  message: string;
  time: string; // Ou Date para manipulação mais fácil
  read: boolean;
  type?: 'info' | 'lembrete' | 'alerta'; // Tipo opcional para estilização
  link?: string; // Link opcional para navegação
}

// Mock de notificações mais completo
const mockNotificacoes: Notificacao[] = [
  {
    id: '1',
    title: "Nova medição registrada",
    message: "A medição de João Silva (Paciente ID: P001) foi registrada com sucesso.",
    time: "Há 2 horas",
    read: false,
    type: 'info',
    link: '/pacientes/P001/medicoes'
  },
  {
    id: '2',
    title: "Lembrete de acompanhamento",
    message: "Maria Oliveira (Paciente ID: P002) precisa de reavaliação hoje.",
    time: "Há 5 horas",
    read: false,
    type: 'lembrete',
    link: '/pacientes/P002'
  },
  {
    id: '3',
    title: "Atualização do Sistema",
    message: "O sistema CraniumCare foi atualizado para a versão 1.2.0 com novas funcionalidades.",
    time: "Ontem",
    read: true,
    type: 'info',
  },
  {
    id: '4',
    title: "Consulta Agendada",
    message: "Sua consulta com Dr. Carlos (Paciente ID: P003) está agendada para amanhã às 10:00.",
    time: "Há 1 dia",
    read: false,
    type: 'lembrete',
    link: '/agenda'
  },
  {
    id: '5',
    title: "Relatório Disponível",
    message: "O relatório de progresso de Ana Beatriz (Paciente ID: P004) está pronto para visualização.",
    time: "Há 3 dias",
    read: true,
    type: 'info',
    link: '/pacientes/P004/relatorios'
  },
];

export function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(mockNotificacoes);

  const marcarComoLida = (id: string) => {
    setNotificacoes(prevNotificacoes =>
      prevNotificacoes.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    // Aqui, em uma implementação real, você também faria uma chamada à API para atualizar o status no backend
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes(prevNotificacoes =>
      prevNotificacoes.map(n => ({ ...n, read: true }))
    );
    // Chamada à API para marcar todas como lidas no backend
  };

  const limparNotificacoesLidas = () => {
    setNotificacoes(prevNotificacoes => prevNotificacoes.filter(n => !n.read));
    // Chamada à API para remover/arquivar notificações lidas no backend
  };

  const todasLidas = notificacoes.every(n => n.read);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Todas as Notificações</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={marcarTodasComoLidas}
                disabled={todasLidas || notificacoes.filter(n => !n.read).length === 0}
                className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Check className="mr-2 h-4 w-4" /> Marcar todas como lidas
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={limparNotificacoesLidas}
                disabled={notificacoes.filter(n => n.read).length === 0}
                className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <BellOff className="mr-2 h-4 w-4" /> Limpar lidas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {notificacoes.length === 0 ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              <BellOff className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-lg">Você não tem nenhuma notificação no momento.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {notificacoes.map(notificacao => (
                <li 
                  key={notificacao.id} 
                  className={cn(
                    "p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150",
                    notificacao.read ? "opacity-70" : "font-medium"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={cn(
                        "text-md",
                        notificacao.read ? "text-gray-700 dark:text-gray-300" : "text-blue-600 dark:text-blue-400"
                      )}>
                        {notificacao.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notificacao.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{notificacao.time}</p>
                    </div>
                    {!notificacao.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => marcarComoLida(notificacao.id)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
                      >
                        <Check className="mr-1 h-4 w-4" /> Marcar como lida
                      </Button>
                    )}
                  </div>
                  {notificacao.link && (
                     <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500" onClick={() => console.log(`Navegar para: ${notificacao.link}`)}>
                       Ver detalhes
                     </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

