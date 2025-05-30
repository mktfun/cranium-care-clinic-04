
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface ChartFiltersProps {
  timePeriod: string;
  onTimePeriodChange: (value: string) => void;
  measurementType?: string;
  onMeasurementTypeChange?: (value: string) => void;
  showMeasurementFilter?: boolean;
  customDateRange?: { start: Date | null; end: Date | null };
  onCustomDateRangeChange?: (range: { start: Date | null; end: Date | null }) => void;
  showCustomDateRange?: boolean;
  onResetFilters?: () => void;
}

const TIME_PERIODS = [
  { value: "7days", label: "Últimos 7 dias" },
  { value: "15days", label: "Últimos 15 dias" },
  { value: "30days", label: "Últimos 30 dias" },
  { value: "3months", label: "Últimos 3 meses" },
  { value: "6months", label: "Últimos 6 meses" },
  { value: "12months", label: "Últimos 12 meses" },
  { value: "currentYear", label: "Ano atual" },
  { value: "custom", label: "Período personalizado" }
];

const MEASUREMENT_TYPES = [
  { value: "all", label: "Todas as medições" },
  { value: "manual", label: "Medições manuais" },
  { value: "foto", label: "Medições por foto" },
  { value: "cientifica", label: "Medições científicas" }
];

export function ChartFilters({
  timePeriod,
  onTimePeriodChange,
  measurementType = "all",
  onMeasurementTypeChange,
  showMeasurementFilter = false,
  customDateRange,
  onCustomDateRangeChange,
  showCustomDateRange = false,
  onResetFilters
}: ChartFiltersProps) {
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date && onCustomDateRangeChange) {
      onCustomDateRangeChange({
        start: date,
        end: customDateRange?.end || null
      });
    }
    setIsStartDateOpen(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date && onCustomDateRangeChange) {
      onCustomDateRangeChange({
        start: customDateRange?.start || null,
        end: date
      });
    }
    setIsEndDateOpen(false);
  };

  const isCustomPeriod = timePeriod === "custom";

  return (
    <Card className="mb-6 border-primary/10 hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Filtros de Análise</CardTitle>
          {onResetFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onResetFilters}
              className="text-muted-foreground hover:text-primary"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {/* Filtro de Período */}
          <div className="min-w-[200px] flex-1">
            <label className="text-sm font-medium mb-2 block text-muted-foreground">
              Período de Análise
            </label>
            <Select value={timePeriod} onValueChange={onTimePeriodChange}>
              <SelectTrigger className="transition-all duration-200 hover:border-primary/60">
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

          {/* Filtro de Tipo de Medição */}
          {showMeasurementFilter && onMeasurementTypeChange && (
            <div className="min-w-[180px] flex-1">
              <label className="text-sm font-medium mb-2 block text-muted-foreground">
                Tipo de Medição
              </label>
              <Select value={measurementType} onValueChange={onMeasurementTypeChange}>
                <SelectTrigger className="transition-all duration-200 hover:border-primary/60">
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

          {/* Seletor de Data Personalizada */}
          {isCustomPeriod && showCustomDateRange && onCustomDateRangeChange && (
            <div className="flex gap-2 items-end">
              <div className="min-w-[140px]">
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Data Inicial
                </label>
                <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal transition-all duration-200 hover:border-primary/60",
                        !customDateRange?.start && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange?.start ? (
                        format(customDateRange.start, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        "Selecionar"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateRange?.start || undefined}
                      onSelect={handleStartDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="min-w-[140px]">
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Data Final
                </label>
                <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal transition-all duration-200 hover:border-primary/60",
                        !customDateRange?.end && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange?.end ? (
                        format(customDateRange.end, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        "Selecionar"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateRange?.end || undefined}
                      onSelect={handleEndDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
