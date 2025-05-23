
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Patient {
  id: string;
  nome: string;
  data_nascimento: string;
}

interface SelectPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPatient: (patientId: string) => void;
}

export function SelectPatientDialog({
  open,
  onOpenChange,
  onSelectPatient,
}: SelectPatientDialogProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load patients when dialog opens
  useEffect(() => {
    if (open) {
      loadPatients();
    }
  }, [open]);
  
  // Filter patients when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      setFilteredPatients(
        patients.filter((patient) =>
          patient.nome.toLowerCase().includes(lowercasedQuery)
        )
      );
    }
  }, [searchQuery, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pacientes")
        .select("id, nome, data_nascimento")
        .order("nome");

      if (error) {
        console.error("Error loading patients:", error);
        toast.error("Erro ao carregar pacientes");
      } else {
        setPatients(data || []);
        setFilteredPatients(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Erro ao carregar dados de pacientes");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patientId: string) => {
    onSelectPatient(patientId);
    onOpenChange(false);
  };

  const handleAddNewPatient = () => {
    onOpenChange(false);
    navigate("/pacientes/registro");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Paciente</DialogTitle>
          <DialogDescription>
            Escolha o paciente para realizar a nova medição
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative my-2">
          <Input
            placeholder="Buscar paciente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="max-h-[300px] overflow-y-auto border rounded-md">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-turquesa" />
            </div>
          ) : filteredPatients.length > 0 ? (
            <div className="divide-y">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  className="w-full text-left px-4 py-3 hover:bg-accent flex items-center justify-between transition-colors"
                  onClick={() => handleSelectPatient(patient.id)}
                >
                  <span className="font-medium">{patient.nome}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              {searchQuery ? 
                "Nenhum paciente encontrado com esse termo." : 
                "Nenhum paciente cadastrado."}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="gap-2 bg-turquesa hover:bg-turquesa/90"
            onClick={handleAddNewPatient}
          >
            <UserPlus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
