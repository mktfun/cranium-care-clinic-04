
export function generateRecomendacoes(severity: string) {
  const baseRecs = [
    "Monitorar posicionamento durante o sono",
    "Estimular tempo de barriga para baixo sob supervisão"
  ];
  
  if (severity === "normal") return [...baseRecs, "Manter acompanhamento regular a cada 3 meses"];
  if (severity === "leve") return [...baseRecs, "Exercícios de estímulo cervical", "Reavaliação em 2 meses"];
  return [...baseRecs, "Exercícios de estímulo cervical", "Considerar terapia de capacete", "Reavaliação em 1 mês"];
}
