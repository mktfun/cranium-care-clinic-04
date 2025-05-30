
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartFiltersProps {
  timePeriod: string;
  onTimePeriodChange: (value: string) => void;
  measurementType?: string;
  onMeasurementTypeChange?: (value: string) => void;
  showMeasurementFilter?: boolean;
}

const TIME_PERIODS = [
  { value: "7days", label: "Últimos 7 dias" },
  { value: "30days", label: "Últimos 30 dias" },
  { value: "6months", label: "Últimos 6 meses" },
  { value: "1year", label: "Ano atual" }
];

const MEASUREMENT_TYPES = [
  { value: "all", label: "Todos os tipos" },
  { value: "foto", label: "Por foto" },
  { value: "manual", label: "Manual" },
  { value: "cientifica", label: "Científica" }
];

export function ChartFilters({
  timePeriod,
  onTimePeriodChange,
  measurementType = "all",
  onMeasurementTypeChange,
  showMeasurementFilter = false
}: ChartFiltersProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[180px]">
            <label className="text-sm font-medium mb-2 block">Período</label>
            <Select value={timePeriod} onValueChange={onTimePeriodChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showMeasurementFilter && onMeasurementTypeChange && (
            <div className="min-w-[180px]">
              <label className="text-sm font-medium mb-2 block">Tipo de Medição</label>
              <Select value={measurementType} onValueChange={onMeasurementTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEASUREMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
