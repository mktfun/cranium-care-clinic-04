
import React from "react";
import { ConfiguracoesSelect } from "./ConfiguracoesSelect";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ConfiguracoesTabProps {
  value: string;
  onChange: (value: string) => void;
}

export function ConfiguracoesTab({ value, onChange }: ConfiguracoesTabProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Opções para o select (restaurada a opção colaboradores)
  const options = [
    { value: "perfil", label: "Perfil" },
    { value: "conta", label: "Conta" },
    { value: "notificacoes", label: "Notificações" },
    { value: "aparencia", label: "Aparência" },
    { value: "colaboradores", label: "Colaboradores" }
  ];

  if (isMobile) {
    return (
      <div className="p-2">
        <ConfiguracoesSelect
          label=""
          value={value}
          options={options}
          onChange={onChange}
          className="w-full"
        />
      </div>
    );
  }

  return null; // Em desktop, usamos a TabsList normal
}
