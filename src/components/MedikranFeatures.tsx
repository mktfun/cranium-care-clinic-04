
import React from "react";
import { FeatureSteps } from "@/components/ui/feature-section";

const features = [
  { 
    step: 'Etapa 1', 
    title: 'Avaliação Craniana',
    content: 'Realize medições precisas do crânio do bebê com ferramentas digitais avançadas.', 
    image: 'https://images.unsplash.com/photo-1547398773-097c1412ba60?q=80&w=2070&auto=format&fit=crop' 
  },
  { 
    step: 'Etapa 2',
    title: 'Análise Detalhada',
    content: 'Obtenha análises completas dos índices cranianos, incluindo plagiocefalia e braquicefalia.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop'
  },
  { 
    step: 'Etapa 3',
    title: 'Acompanhamento',
    content: 'Monitore o progresso do tratamento ao longo do tempo com gráficos e visualizações detalhadas.',
    image: 'https://images.unsplash.com/photo-1581579186913-45ac9045b63a?q=80&w=2070&auto=format&fit=crop'
  },
]

export function MedikranFeatures() {
  return (
    <div className="bg-white dark:bg-gray-950">
      <FeatureSteps 
        features={features}
        title="Como Funciona o Medikran"
        autoPlayInterval={5000}
        className="pt-0 pb-8"
      />
    </div>
  )
}
