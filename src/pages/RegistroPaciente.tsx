import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const pacienteSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  dataNascimento: z.date({
    required_error: "A data de nascimento é obrigatória",
  }),
  sexo: z.enum(["M", "F"], {
    required_error: "O sexo é obrigatório",
  }),
  responsavelNome: z.string().min(3, { message: "O nome do responsável deve ter pelo menos 3 caracteres" }),
  responsavelTelefone: z.string().min(10, { message: "O telefone deve ter pelo menos 10 caracteres" }).optional(),
  responsavelEmail: z.string().email({ message: "E-mail inválido" }).optional(),
});

type PacienteForm = z.infer<typeof pacienteSchema>;

export default function RegistroPaciente() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [registrarMedicao, setRegistrarMedicao] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const { 
    control, 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<PacienteForm>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      nome: "",
      responsavelNome: "",
      responsavelTelefone: "",
      responsavelEmail: ""
    }
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Erro ao buscar usuário:", authError.message);
        toast.error("Erro ao buscar dados do usuário. Por favor, tente novamente.");
        return;
      }
      if (user) {
        setUserId(user.id);
      } else {
        console.error("Usuário não autenticado.");
        toast.error("Sessão expirada ou usuário não autenticado. Por favor, faça login novamente para registrar um paciente.");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const onSubmit = async (data: PacienteForm) => {
    if (!userId) {
      toast.error("ID do usuário não está disponível. Não é possível registrar o paciente. Por favor, recarregue a página ou faça login novamente.");
      console.error("Tentativa de submissão sem userId.");
      setSubmitting(false);
      return;
    }

    try {
      setSubmitting(true);
      
      const responsaveis = {
        nome: data.responsavelNome,
        telefone: data.responsavelTelefone || "",
        email: data.responsavelEmail || "",
      };
      
      const { data: pacienteData, error } = await supabase
        .from('pacientes')
        .insert({
          nome: data.nome,
          data_nascimento: format(data.dataNascimento, 'yyyy-MM-dd'),
          sexo: data.sexo,
          responsaveis: responsaveis,
          user_id: userId, 
        })
        .select('id')
        .single();

      if (error) {
        toast.error(`Erro ao registrar paciente: ${error.message}`);
        console.error("Erro ao registrar paciente:", error);
      } else {
        toast.success("Paciente registrado com sucesso!");
        if (registrarMedicao && pacienteData?.id) {
          navigate(`/pacientes/${pacienteData.id}/nova-medicao`);
        } else {
          navigate("/pacientes");
        }
      }
    } catch (e) {
      const err = e as Error;
      console.error("Erro inesperado ao registrar paciente:", err);
      toast.error(`Ocorreu um erro inesperado: ${err.message}. Tente novamente.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-6 animate-fade-in">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          className="mr-2" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Registro de Paciente</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Dados do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome" className="text-sm font-medium">
                  Nome completo do paciente<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nome"
                  placeholder="Nome completo"
                  {...register("nome")}
                  className={errors.nome ? "border-destructive" : ""}
                />
                {errors.nome && (
                  <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataNascimento" className="text-sm font-medium">
                    Data de Nascimento<span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="dataNascimento"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                              errors.dataNascimento && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.dataNascimento && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.dataNascimento.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="sexo" className="text-sm font-medium">
                    Sexo<span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="sexo"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger
                          className={errors.sexo ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.sexo && (
                    <p className="text-xs text-destructive mt-1">{errors.sexo.message}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-2">Responsável</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="responsavelNome" className="text-sm font-medium">
                      Nome do Responsável<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="responsavelNome"
                      placeholder="Nome completo"
                      {...register("responsavelNome")}
                      className={errors.responsavelNome ? "border-destructive" : ""}
                    />
                    {errors.responsavelNome && (
                      <p className="text-xs text-destructive mt-1">{errors.responsavelNome.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="responsavelTelefone" className="text-sm font-medium">
                        Telefone
                      </Label>
                      <Input
                        id="responsavelTelefone"
                        placeholder="(XX) XXXXX-XXXX"
                        {...register("responsavelTelefone")}
                        className={errors.responsavelTelefone ? "border-destructive" : ""}
                      />
                      {errors.responsavelTelefone && (
                        <p className="text-xs text-destructive mt-1">{errors.responsavelTelefone.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="responsavelEmail" className="text-sm font-medium">
                        E-mail
                      </Label>
                      <Input
                        id="responsavelEmail"
                        type="email"
                        placeholder="email@exemplo.com"
                        {...register("responsavelEmail")}
                        className={errors.responsavelEmail ? "border-destructive" : ""}
                      />
                      {errors.responsavelEmail && (
                        <p className="text-xs text-destructive mt-1">{errors.responsavelEmail.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="registrarMedicao"
                  className="mr-2"
                  checked={registrarMedicao}
                  onChange={() => setRegistrarMedicao(!registrarMedicao)}
                />
                <Label htmlFor="registrarMedicao">
                  Registrar medição após cadastro do paciente
                </Label>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/pacientes")}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-turquesa hover:bg-turquesa/90"
                  disabled={submitting || !userId}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Registrar Paciente'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

