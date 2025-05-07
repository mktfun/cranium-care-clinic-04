
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  {
    mes: "Jan",
    cvai: 2.1,
    diagonal: 5,
    ic: 74,
  },
  {
    mes: "Fev",
    cvai: 3.5,
    diagonal: 7.5,
    ic: 76,
  },
  {
    mes: "Mar",
    cvai: 5.2,
    diagonal: 9.8,
    ic: 78,
  },
  {
    mes: "Abr",
    cvai: 4.3,
    diagonal: 8.2,
    ic: 79,
  },
  {
    mes: "Mai",
    cvai: 3.2,
    diagonal: 6.8,
    ic: 81,
  },
  {
    mes: "Jun",
    cvai: 2.8,
    diagonal: 6.1,
    ic: 83,
  },
];

interface MedicaoLineChartProps {
  titulo?: string;
  descricao?: string;
  altura?: number;
}

export function MedicaoLineChart({
  titulo = "Evolução das Medições",
  descricao = "Acompanhamento de índices ao longo dos últimos 6 meses",
  altura = 300,
}: MedicaoLineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={altura}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="mes" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cvai"
              stroke="#029daf"
              activeDot={{ r: 8 }}
              name="CVAI (%)"
              strokeWidth={2}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="diagonal"
              stroke="#AF5B5B"
              name="Dif. Diagonal (mm)"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ic"
              stroke="#276FBF"
              name="Índice Craniano"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
