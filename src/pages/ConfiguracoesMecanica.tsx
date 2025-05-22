
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ConfiguracoesTab } from "@/components/configuracoes-mecanica/ConfiguracoesTab";
import { PerfilTab } from "@/components/configuracoes-mecanica/PerfilTab";
import { UnidadesTab } from "@/components/configuracoes-mecanica/UnidadesTab";
import { AplicativoTab } from "@/components/configuracoes-mecanica/AplicativoTab";
import { NegocioTab } from "@/components/configuracoes-mecanica/NegocioTab";
import { UsuariosTab } from "@/components/configuracoes-mecanica/UsuariosTab";
import { Building, Briefcase, Sliders, User, Users } from "lucide-react";

export default function ConfiguracoesMecanica() {
  const [activeTab, setActiveTab] = useState("perfil");
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {isMobile ? (
          <ConfiguracoesTab value={activeTab} onChange={setActiveTab} />
        ) : (
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User size={16} />
              <span>Conta</span>
            </TabsTrigger>
            <TabsTrigger value="unidades" className="flex items-center gap-2">
              <Building size={16} />
              <span>Unidades</span>
            </TabsTrigger>
            <TabsTrigger value="aplicativo" className="flex items-center gap-2">
              <Sliders size={16} />
              <span>Aplicativo</span>
            </TabsTrigger>
            <TabsTrigger value="negocio" className="flex items-center gap-2">
              <Briefcase size={16} />
              <span>Negócio</span>
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <Users size={16} />
              <span>Usuários</span>
            </TabsTrigger>
          </TabsList>
        )}
        
        <Card>
          <CardContent className="pt-6">
            <TabsContent value="perfil">
              <PerfilTab />
            </TabsContent>
            
            <TabsContent value="unidades">
              <UnidadesTab />
            </TabsContent>
            
            <TabsContent value="aplicativo">
              <AplicativoTab />
            </TabsContent>
            
            <TabsContent value="negocio">
              <NegocioTab />
            </TabsContent>
            
            <TabsContent value="usuarios">
              <UsuariosTab />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
