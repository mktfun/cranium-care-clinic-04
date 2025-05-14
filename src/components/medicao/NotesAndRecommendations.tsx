
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesAndRecommendationsProps {
  observacoes: string;
  recomendacoes: string[];
  onObservacoesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRecomendacoesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const NotesAndRecommendations: React.FC<NotesAndRecommendationsProps> = ({
  observacoes,
  recomendacoes,
  onObservacoesChange,
  onRecomendacoesChange
}) => {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          placeholder="Observações adicionais"
          value={observacoes}
          onChange={onObservacoesChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="recomendacoes">Recomendações (uma por linha)</Label>
        <Textarea
          id="recomendacoes"
          placeholder="Recomendações (uma por linha)"
          value={recomendacoes.join('\n')}
          onChange={onRecomendacoesChange}
        />
      </div>
    </>
  );
};

export default NotesAndRecommendations;
