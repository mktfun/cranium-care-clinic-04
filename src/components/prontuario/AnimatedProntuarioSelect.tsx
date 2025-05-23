
import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, FileText, Calendar, Plus, Clipboard, Stethoscope } from "lucide-react";
import { ProntuarioSelect } from "./ProntuarioSelect";

interface AnimatedProntuarioSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function AnimatedProntuarioSelect({
  value,
  onChange
}: AnimatedProntuarioSelectProps) {
  const options = useMemo(() => [{
    value: "dados-pessoais",
    label: "Dados Pessoais",
    icon: <User className="h-4 w-4" />
  }, {
    value: "historico-medico",
    label: "Histórico Médico",
    icon: <FileText className="h-4 w-4" />
  }, {
    value: "consultas",
    label: "Consultas",
    icon: <Calendar className="h-4 w-4" />
  }, {
    value: "avaliacoes-craniais",
    label: "Avaliações Craniais",
    icon: <FileText className="h-4 w-4" />
  }, {
    value: "avaliacao",
    label: "Avaliação",
    icon: <Clipboard className="h-4 w-4" />
  }, {
    value: "conduta",
    label: "Conduta",
    icon: <Stethoscope className="h-4 w-4" />
  }], []);

  // Find the current option label
  const currentOptionLabel = useMemo(() => {
    const currentOption = options.find(opt => opt.value === value);
    return currentOption ? currentOption.label : "";
  }, [options, value]);

  return (
    <div className="relative">
      <AnimatePresence>
        <ProntuarioSelect 
          value={value} 
          options={options} 
          onChange={onChange} 
          className="mt-2" 
          customIcon={<Plus className="h-4 w-4" />}
        />
      </AnimatePresence>
    </div>
  );
}
