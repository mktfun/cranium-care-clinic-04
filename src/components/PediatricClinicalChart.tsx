
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Tipos de dados para o gráfico
interface PediatricChartProps {
  altura?: number;
  tipo: "idade" | "status" | "sexo";
  titulo?: string;
  descricao?: string;
}

// Dados de exemplo - em uma aplicação real viriam do banco de dados
const getChartData = (tipo: "idade" | "status" | "sexo") => {
  switch (tipo) {
    case "idade":
      return [
        { name: "0-6 meses", valor: 28, fill: "#2563eb" },
        { name: "6-12 meses", valor: 32, fill: "#7c3aed" },
        { name: "1-2 anos", valor: 25, fill: "#f59e0b" },
        { name: "2+ anos", valor: 15, fill: "#10b981" },
      ];
    case "status":
      return [
        { name: "Normal", valor: 65, fill: "#10b981" },
        { name: "Leve", valor: 20, fill: "#f59e0b" },
        { name: "Moderado", valor: 10, fill: "#f97316" },
        { name: "Severo", valor: 5, fill: "#ef4444" },
      ];
    case "sexo":
      return [
        { name: "Feminino", valor: 52, fill: "#ec4899" },
        { name: "Masculino", valor: 48, fill: "#3b82f6" },
      ];
    default:
      return [];
  }
};

export function PediatricClinicalChart({ altura = 300, tipo, titulo, descricao }: PediatricChartProps) {
  const data = getChartData(tipo);
  
  // Títulos e descrições padrão
  const tituloPadrao = {
    idade: "Distribuição por Idade",
    status: "Status dos Pacientes",
    sexo: "Distribuição por Gênero",
  }[tipo];

  const descricaoPadrao = {
    idade: "Distribuição de pacientes por faixa etária",
    status: "Distribuição por severidade de deformidades cranianas",
    sexo: "Distribuição de pacientes por gênero",
  }[tipo];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{titulo || tituloPadrao}</CardTitle>
        <CardDescription className="text-xs">{descricao || descricaoPadrao}</CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <div style={{ width: "100%", height: altura }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={altura > 250 ? altura * 0.3 : altura * 0.35}
                dataKey="valor"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              />
              <Tooltip 
                formatter={(value: any) => [`${value}%`, "Porcentagem"]}
                contentStyle={{ 
                  borderRadius: "8px", 
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  fontSize: "12px",
                  padding: "6px 10px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
