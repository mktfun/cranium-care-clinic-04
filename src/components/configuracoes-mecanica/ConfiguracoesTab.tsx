
import { Building, Briefcase, Sliders, User, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConfiguracoesTabProps {
  value: string;
  onChange: (value: string) => void;
}

export function ConfiguracoesTab({ value, onChange }: ConfiguracoesTabProps) {
  return (
    <div className="w-full mb-4">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma seção" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4 mr-2" />
            Conta
          </SelectItem>
          <SelectItem value="unidades" className="flex items-center gap-2">
            <Building className="h-4 w-4 mr-2" />
            Unidades
          </SelectItem>
          <SelectItem value="aplicativo" className="flex items-center gap-2">
            <Sliders className="h-4 w-4 mr-2" />
            Aplicativo
          </SelectItem>
          <SelectItem value="negocio" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 mr-2" />
            Negócio
          </SelectItem>
          <SelectItem value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
