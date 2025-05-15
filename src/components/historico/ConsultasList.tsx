
import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

interface ConsultasListProps {
  consultas: any[];
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
  isReadOnly?: boolean;
}

export function ConsultasList({ 
  consultas, 
  onEdit, 
  onDelete,
  isReadOnly = false 
}: ConsultasListProps) {
  
  if (consultas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma consulta registrada.</p>
      </div>
    );
  }
  
  const formatData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };
  
  const formatTimeAgo = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return formatDistanceToNow(data, { addSuffix: true, locale: ptBR });
    } catch (error) {
      return "";
    }
  };
  
  return (
    <div className="space-y-4">
      {consultas.map((consulta) => (
        <div 
          key={consulta.id} 
          className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{consulta.tipo}</Badge>
                <h4 className="font-medium">{consulta.descricao}</h4>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatTimeAgo(consulta.data)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Data: {formatData(consulta.data)}
              </p>
              
              {consulta.profissional && (
                <div className="mb-2">
                  <span className="text-sm font-medium">Profissional:</span>
                  <p className="text-sm">{consulta.profissional} {consulta.especialidade ? `(${consulta.especialidade})` : ''}</p>
                </div>
              )}
              
              {consulta.motivo && (
                <div className="mb-2">
                  <span className="text-sm font-medium">Motivo:</span>
                  <p className="text-sm">{consulta.motivo}</p>
                </div>
              )}
              
              {consulta.diagnostico && (
                <div className="mb-2">
                  <span className="text-sm font-medium">Diagnóstico:</span>
                  <p className="text-sm">{consulta.diagnostico}</p>
                </div>
              )}
              
              {consulta.tratamento && (
                <div className="mb-2">
                  <span className="text-sm font-medium">Tratamento:</span>
                  <p className="text-sm">{consulta.tratamento}</p>
                </div>
              )}
              
              {consulta.observacoes && (
                <div>
                  <span className="text-sm font-medium">Observações:</span>
                  <p className="text-sm">{consulta.observacoes}</p>
                </div>
              )}
            </div>
            
            {!isReadOnly && (
              <div className="flex gap-2 ml-4">
                {onEdit && (
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8" 
                    onClick={() => onEdit(consulta)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
                    onClick={() => onDelete(consulta.id)}
                    title="Excluir"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
