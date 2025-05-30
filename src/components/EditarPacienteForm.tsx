
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Paciente, Responsavel } from "@/types";
import { useInputMask } from "@/hooks/use-input-mask";

const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const formSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  data_nascimento: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, { message: "Data de nascimento inválida" }),
  sexo: z.string().min(1, { message: "Selecione o sexo" }),
  cpf: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  responsaveis: z.any().optional(),
});

export interface EditarPacienteFormProps {
  paciente: Paciente;
  onSuccess?: () => Promise<void>;
}

export function EditarPacienteForm({ paciente, onSuccess }: EditarPacienteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatCPF, formatCEP, validateCPF, validateCEP } = useInputMask();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      data_nascimento: "",
      sexo: "",
      cpf: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      responsaveis: "",
    },
  });

  useEffect(() => {
    if (paciente) {
      // Format responsaveis for display if it's an array
      let responsaveisValue = "";
      
      if (paciente.responsaveis) {
        if (Array.isArray(paciente.responsaveis)) {
          responsaveisValue = paciente.responsaveis
            .map((r: Responsavel) => {
              const nome = r.nome || '';
              const telefone = r.telefone ? ` - Tel: ${r.telefone}` : '';
              const email = r.email ? ` - Email: ${r.email}` : '';
              const parentesco = r.parentesco ? ` (${r.parentesco})` : '';
              return `${nome}${telefone}${email}${parentesco}`;
            })
            .join('\n');
        } else if (typeof paciente.responsaveis === 'string') {
          responsaveisValue = paciente.responsaveis;
        }
      }

      form.reset({
        nome: paciente.nome || "",
        data_nascimento: paciente.data_nascimento || "",
        sexo: paciente.sexo || "",
        cpf: paciente.cpf || "",
        endereco: paciente.endereco || "",
        cidade: paciente.cidade || "",
        estado: paciente.estado || "",
        cep: paciente.cep || "",
        responsaveis: responsaveisValue,
      });
    }
  }, [paciente, form]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const formattedCpf = formatCPF(e.target.value);
    onChange(formattedCpf);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const formattedCep = formatCEP(e.target.value);
    onChange(formattedCep);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      // Validações opcionais
      if (values.cpf && !validateCPF(values.cpf)) {
        toast.error("CPF inválido. Verifique o formato.");
        return;
      }

      if (values.cep && !validateCEP(values.cep)) {
        toast.error("CEP inválido. Verifique o formato.");
        return;
      }
      
      const { error } = await supabase
        .from("pacientes")
        .update({
          nome: values.nome,
          data_nascimento: values.data_nascimento,
          sexo: values.sexo,
          cpf: values.cpf || null,
          endereco: values.endereco || null,
          cidade: values.cidade || null,
          estado: values.estado || null,
          cep: values.cep || null,
          responsaveis: values.responsaveis,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paciente.id);

      if (error) {
        console.error("Erro ao atualizar paciente:", error);
        toast.error("Erro ao atualizar paciente. Tente novamente.");
        return;
      }

      toast.success("Paciente atualizado com sucesso!");
      
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados Pessoais */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg mb-4">Dados Pessoais</h3>
          
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="data_nascimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sexo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o sexo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="000.000.000-00"
                      value={field.value || ""}
                      onChange={(e) => handleCpfChange(e, field.onChange)}
                      maxLength={14}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg mb-4">Endereço</h3>
          
          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço completo</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Rua, número, complemento" 
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome da cidade" 
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ESTADOS_BRASIL.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="00000-000"
                      value={field.value || ""}
                      onChange={(e) => handleCepChange(e, field.onChange)}
                      maxLength={9}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Responsáveis */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg mb-4">Responsáveis</h3>
          <FormField
            control={form.control}
            name="responsaveis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsáveis</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Nome dos pais ou responsáveis" 
                    className="resize-none" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-turquesa hover:bg-turquesa/90"
          >
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
