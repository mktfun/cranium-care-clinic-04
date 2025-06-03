
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit, Save, X } from "lucide-react";
import { Prontuario } from "@/types";
import { toast } from "sonner";

interface ReadOnlyProntuarioTabProps {
  title: string;
  icon: React.ReactNode;
  prontuario: Prontuario;
  children: (isEditing: boolean, onEdit: (field: string, value: any) => void) => React.ReactNode;
  onUpdate?: (field: string, value: any) => void;
  fields: string[];
}

export function ReadOnlyProntuarioTab({
  title,
  icon,
  prontuario,
  children,
  onUpdate,
  fields
}: ReadOnlyProntuarioTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    // Inicializar dados de edição com valores atuais
    const currentData: any = {};
    fields.forEach(field => {
      currentData[field] = prontuario[field as keyof Prontuario] || '';
    });
    setEditData(currentData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({});
    setIsEditing(false);
  };

  const handleFieldEdit = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!onUpdate) return;

    setIsSaving(true);
    try {
      const updates = [];
      
      // Verificar quais campos mudaram e salvar
      for (const field of fields) {
        const currentValue = prontuario[field as keyof Prontuario] || '';
        const newValue = editData[field] || '';
        
        if (currentValue !== newValue) {
          const finalValue = newValue.trim() || null;
          updates.push(onUpdate(field, finalValue));
        }
      }

      if (updates.length > 0) {
        await Promise.all(updates);
        toast.success("Dados salvos com sucesso!");
      } else {
        toast.info("Nenhuma alteração detectada.");
      }
      
      setIsEditing(false);
      setEditData({});
    } catch (error) {
      toast.error("Erro ao salvar dados.");
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-turquesa hover:bg-turquesa/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children(isEditing, handleFieldEdit)}
      </CardContent>
    </Card>
  );
}
