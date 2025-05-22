
import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, FileText, Calendar, Plus } from "lucide-react";
import { ProntuarioSelect } from "./ProntuarioSelect";

interface AnimatedProntuarioSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function AnimatedProntuarioSelect({ value, onChange }: AnimatedProntuarioSelectProps) {
  const options = useMemo(() => [
    {
      value: "dados-pessoais",
      label: "Dados Pessoais",
      icon: <User className="h-4 w-4" />,
    },
    {
      value: "historico-medico",
      label: "Histórico Médico",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      value: "consultas",
      label: "Consultas",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      value: "avaliacoes-craniais",
      label: "Avaliações Craniais",
      icon: <FileText className="h-4 w-4" />,
    },
  ], []);

  // Find the current option label
  const currentOptionLabel = useMemo(() => {
    const currentOption = options.find(opt => opt.value === value);
    return currentOption ? currentOption.label : "";
  }, [options, value]);

  return (
    <div className="relative">
      <motion.div
        className="p-2 border rounded-md bg-white dark:bg-neutral-800 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          {options.find(opt => opt.value === value)?.icon}
          <span className="font-medium">{currentOptionLabel}</span>
        </div>
        <Plus className="h-5 w-5 text-primary" />
      </motion.div>
      
      <AnimatePresence>
        <ProntuarioSelect
          value={value}
          options={options}
          onChange={onChange}
          className="mt-2"
        />
      </AnimatePresence>
    </div>
  );
}
