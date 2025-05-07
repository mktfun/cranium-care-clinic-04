
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  ChevronLeft, 
  Calendar,
  Download,
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  FileText,
  Plus
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { obterPacientePorId } from "@/data/mock-data";
import { EditarPacienteForm } from "@/components/EditarPacienteForm";
import { toast } from "sonner";
import { PatientTasks } from "@/components/PatientTasks";

export default function DetalhePaciente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const paciente = obterPacientePorId(id || "");
  const [tab, setTab] = useState("info");
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [dialogExcluirAberto, setDialogExcluirAberto] = useState(false);
  const [dialogNovaMedicaoAberto, setDialogNovaMedicaoAberto] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState("");
  
  if (!paciente) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">Paciente não encontrado</p>
        <Button onClick={() => navigate("/pacientes")}>Voltar para Lista</Button>
      </div>
    );
  }
  
  // Ordenar medições por data (mais recente primeiro)
  const medicoesOrdenadas = [...paciente.medicoes].sort((a, b) => 
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );
  
  const ultimaMedicao = medicoesOrdenadas[0];
  
  // Formatar data para formato brasileiro
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  const getAgeDisplay = (idadeEmMeses: number, dataNascimento: string) => {
    const dataNasc = new Date(dataNascimento);
    const hoje = new Date();
    let idadeEmAnos = hoje.getFullYear() - dataNasc.getFullYear();
    const mesesExtras = hoje.getMonth() - dataNasc.getMonth();
    if (mesesExtras < 0) {
      idadeEmAnos--;
    }
    return `${idadeEmAnos} anos ${idadeEmMeses % 12} meses`;
  };
  
  const handleExcluirPaciente = () => {
    if (confirmarExclusao.toLowerCase() === "deletar") {
      // Simulando a exclusão do paciente
      toast.success("Paciente excluído com sucesso!");
      setDialogExcluirAberto(false);
      setConfirmarExclusao("");
      navigate("/pacientes");
    } else {
      toast.error("Digite 'deletar' para confirmar a exclusão.");
    }
  };
  
  const handleNovaMedicao = () => {
    navigate(`/pacientes/${id}/nova-medicao`);
  };
  
  const handleEditarPaciente = () => {
    setDialogEditarAberto(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/pacientes")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">{paciente.nome}</h2>
            <div className="text-sm text-muted-foreground">
              {getAgeDisplay(paciente.idadeEmMeses, paciente.dataNascimento)} • {formatarData(paciente.dataNascimento)}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(`/pacientes/${id}/relatorio`)}>
            <FileText className="h-4 w-4 mr-2" /> Gerar Relatório
          </Button>
          <Button onClick={() => navigate(`/pacientes/${id}/nova-medicao`)} className="bg-turquesa hover:bg-turquesa/90">
            <Plus className="h-4 w-4 mr-2" /> Nova Medição
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full mb-4 overflow-x-auto flex-wrap md:flex-nowrap justify-start md:justify-center">
          <TabsTrigger value="info" className="text-sm py-1.5 px-3 md:px-6 flex-grow">Informações</TabsTrigger>
          <TabsTrigger value="medicoes" className="text-sm py-1.5 px-3 md:px-6 flex-grow">Medições</TabsTrigger>
          <TabsTrigger value="evolucao" className="text-sm py-1.5 px-3 md:px-6 flex-grow">Evolução</TabsTrigger>
          <TabsTrigger value="tarefas" className="text-sm py-1.5 px-3 md:px-6 flex-grow">Tarefas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Paciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome Completo</p>
                    <p className="font-medium">{paciente.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">{formatarData(paciente.dataNascimento)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Idade</p>
                    <p className="font-medium">{paciente.idadeEmMeses} meses</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sexo</p>
                    <p className="font-medium">{paciente.sexo === "M" ? "Masculino" : "Feminino"}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Responsável</p>
                    <p className="font-medium">{paciente.responsaveis?.[0]?.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p>{paciente.responsaveis?.[0]?.telefone}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="text-sm" onClick={handleEditarPaciente}>
                  <Pencil className="h-4 w-4 mr-2" /> Editar Dados
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Última Medição</CardTitle>
                <CardDescription>
                  {ultimaMedicao ? formatarData(ultimaMedicao.data) : "Nenhuma medição registrada"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ultimaMedicao ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Comprimento</p>
                        <p className="text-lg font-medium">{ultimaMedicao.comprimento} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Largura</p>
                        <p className="text-lg font-medium">{ultimaMedicao.largura} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Diagonal D</p>
                        <p className="text-lg font-medium">{ultimaMedicao.diagonalD} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Diagonal E</p>
                        <p className="text-lg font-medium">{ultimaMedicao.diagonalE} mm</p>
                      </div>
                    </div>
                    <hr />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Diferença Diagonais</p>
                        <p className="text-lg font-medium">{ultimaMedicao.diferencaDiagonais} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Índice Craniano</p>
                        <p className="text-lg font-medium">{ultimaMedicao.indiceCraniano}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CVAI</p>
                        <p className="text-lg font-medium">{ultimaMedicao.cvai}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <StatusBadge status={ultimaMedicao.status} className="mt-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma medição registrada</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="medicoes">
          <div className="rounded-md border">
            {medicoesOrdenadas.length > 0 ? (
              <div className="divide-y">
                {medicoesOrdenadas.map((medicao) => (
                  <div key={medicao.id} className="p-4">
                    <div className="flex flex-wrap justify-between items-start mb-3">
                      <div className="flex items-center mb-2 md:mb-0">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{formatarData(medicao.data)}</span>
                        <StatusBadge status={medicao.status} className="ml-3" />
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PDF
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Comprimento</p>
                        <p>{medicao.comprimento} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Largura</p>
                        <p>{medicao.largura} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Diagonal D</p>
                        <p>{medicao.diagonalD} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Diagonal E</p>
                        <p>{medicao.diagonalE} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Dif. Diagonais</p>
                        <p>{medicao.diferencaDiagonais} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Índice Craniano</p>
                        <p>{medicao.indiceCraniano}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CVAI</p>
                        <p>{medicao.cvai}%</p>
                      </div>
                    </div>
                    
                    {medicao.observacoes && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground">Observações</p>
                        <p>{medicao.observacoes}</p>
                      </div>
                    )}
                    
                    {medicao.recomendacoes && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground">Recomendações</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {medicao.recomendacoes.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                Nenhuma medição registrada para este paciente.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="evolucao">
          {ultimaMedicao ? (
            <MedicaoLineChart 
              titulo="Evolução do Paciente" 
              descricao="Acompanhamento das medições ao longo do tempo"
              altura={400} 
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Não há medições registradas para mostrar a evolução.
              </p>
              <Button onClick={() => navigate(`/pacientes/${id}/nova-medicao`)} className="bg-turquesa hover:bg-turquesa/90">
                <Plus className="h-4 w-4 mr-2" /> Registrar Primeira Medição
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tarefas">
          <PatientTasks patientId={id || ""} />
        </TabsContent>
      </Tabs>
      
      {/* Dialog de Edição de Paciente */}
      <Dialog open={dialogEditarAberto} onOpenChange={setDialogEditarAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Atualize os dados do paciente. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <EditarPacienteForm 
            paciente={paciente} 
            onSalvar={() => {
              setDialogEditarAberto(false);
              toast.success("Dados do paciente atualizados com sucesso!");
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={dialogExcluirAberto} onOpenChange={setDialogExcluirAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Excluir Paciente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o paciente
              <span className="font-medium"> {paciente.nome} </span> 
              e todos os seus dados do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="confirmar-exclusao">
              Digite "deletar" para confirmar a exclusão:
            </Label>
            <Input 
              id="confirmar-exclusao" 
              value={confirmarExclusao}
              onChange={(e) => setConfirmarExclusao(e.target.value)}
              className="mt-2"
              placeholder="deletar"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive" 
              onClick={handleExcluirPaciente}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
