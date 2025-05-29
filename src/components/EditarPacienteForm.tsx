
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

const formSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  data_nascimento: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, { message: "Data de nascimento inválida" }),
  sexo: z.string().min(1, { message: "Selecione o sexo" }),
  responsaveis: z.any().optional(),
});

export interface EditarPacienteFormProps {
  paciente: Paciente;
  onSuccess?: () => Promise<void>;
}

export function EditarPacienteForm({ paciente, onSuccess }: EditarPacienteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      data_nascimento: "",
      sexo: "",
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
        responsaveis: responsaveisValue,
      });
    }
  }, [paciente, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from("pacientes")
        .update({
          nome: values.nome,
          data_nascimento: values.data_nascimento,
          sexo: values.sexo,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
