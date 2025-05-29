
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bell, BellOff, Check, Trash2, Filter, AlertCircle, Info, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Notificacao {
  id: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
  user_id: string;
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    fetchNotificacoes();
    
    // Configurar real-time subscription
    const channel = supabase
      .channel('notificacoes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notificacoes'
        },
        () => {
          fetchNotificacoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotificacoes = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotificacoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotificacoes(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return;

      const { error } = await supabase
        .from('notificacoes')
        .update({ read: true })
        .eq('user_id', session.user.id)
        .eq('read', false);

      if (error) throw error;
      
      setNotificacoes(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar todas as notificações como lidas');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNotificacoes(prev => prev.filter(notif => notif.id !== id));
      toast.success('Notificação removida');
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
      toast.error('Erro ao remover notificação');
    }
  };

  const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes('erro') || title.toLowerCase().includes('falha')) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    if (title.toLowerCase().includes('sucesso') || title.toLowerCase().includes('concluído')) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Info className="h-5 w-5 text-blue-500" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Agora mesmo' : `${diffInMinutes} min atrás`;
    }
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    }
    
    return date.toLocaleDateString('pt-BR');
  };

  const filteredNotificacoes = notificacoes.filter(notif => {
    switch (filter) {
      case "unread": return !notif.read;
      case "read": return notif.read;
      default: return true;
    }
  });

  const unreadCount = notificacoes.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-turquesa" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            Gerencie suas notificações e alertas do sistema
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">Não lidas</SelectItem>
              <SelectItem value="read">Lidas</SelectItem>
            </SelectContent>
          </Select>
          
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead}
              variant="outline"
              className="whitespace-nowrap"
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotificacoes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {filter === "all" ? "Nenhuma notificação" : 
                 filter === "unread" ? "Nenhuma notificação não lida" : 
                 "Nenhuma notificação lida"}
              </h3>
              <p className="text-muted-foreground">
                {filter === "all" ? "Você não possui notificações no momento." :
                 filter === "unread" ? "Todas as suas notificações foram lidas." :
                 "Você não possui notificações lidas."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotificacoes.map((notificacao) => (
            <Card key={notificacao.id} className={`transition-all ${!notificacao.read ? 'border-turquesa/50 bg-turquesa/5' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    {getNotificationIcon(notificacao.title)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${!notificacao.read ? 'font-semibold' : ''}`}>
                          {notificacao.title}
                        </h4>
                        {!notificacao.read && (
                          <div className="w-2 h-2 bg-turquesa rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notificacao.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notificacao.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {!notificacao.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notificacao.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNotification(notificacao.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
