
"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Activity, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { FeatureSteps } from "@/components/ui/feature-section";

// Array de recursos para exibir no carousel
const recursos = [
  {
    icon: Brain,
    title: "Medições Precisas",
    description: "Avaliação craniana com alta precisão",
    color: "text-blue-500"
  },
  {
    icon: Activity,
    title: "Monitoramento Contínuo",
    description: "Acompanhamento da evolução do paciente",
    color: "text-green-500"
  },
  {
    icon: Calendar,
    title: "Agendamento Inteligente",
    description: "Organização eficiente de consultas",
    color: "text-purple-500"
  },
  {
    icon: Clock,
    title: "Histórico Completo",
    description: "Acesso a todo histórico de medições",
    color: "text-orange-500"
  }
];

// Dados para o componente FeatureSteps
const medikranFeatures = [
  { 
    step: 'Passo 1', 
    title: 'Cadastre o Paciente',
    content: 'Inicie o acompanhamento com um cadastro simples e completo do seu paciente.', 
    image: '/lovable-uploads/2d224b4c-3e28-41af-9836-25a55082181a.png' 
  },
  { 
    step: 'Passo 2',
    title: 'Realize as Medições',
    content: 'Faça medições precisas do crânio do bebê usando ferramentas científicas avançadas.',
    image: '/lovable-uploads/f27417e2-1c2a-43d1-a465-0b99f9dde50a.png'
  },
  { 
    step: 'Passo 3',
    title: 'Acompanhe a Evolução',
    content: 'Visualize relatórios detalhados e gráficos de evolução para monitoramento completo.',
    image: '/lovable-uploads/b51ddd39-04ec-4d53-9607-336dfd54259d.png'
  },
];

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-[500px] pt-20">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Bem-vindo ao <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-turquesa">
                Medikran
              </span>
            </h1>
            <p className="mt-4 text-xl text-gray-700 dark:text-gray-300 max-w-lg mx-auto">
              Sistema avançado para medição e acompanhamento craniano em bebês
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <Button asChild size="lg" className="bg-turquesa hover:bg-turquesa/90">
                <Link to="/login">Entrar no Sistema</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/registro">Criar Conta</Link>
              </Button>
            </div>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center h-full">
          {/* Dashboard preview image */}
          <img
            src="/lovable-uploads/1c64556f-1265-455b-bd7b-b264f9ea1265.png"
            alt="Medikran Dashboard Preview"
            className="mx-auto rounded-2xl object-contain h-[40%] max-w-full"
            draggable={false}
          />
          
          {/* Feature Steps para o Medikran */}
          <div className="w-full max-w-6xl mt-4">
            <FeatureSteps 
              features={medikranFeatures}
              title="Como funciona o Medikran"
              autoPlayInterval={4000}
              imageHeight="h-[300px] md:h-[350px]"
              className="pt-0"
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 dark:from-black/20 to-transparent rounded-2xl flex flex-col items-center justify-end pb-10">
            <p className="text-center text-xl font-medium text-black dark:text-white">
              Medições precisas e análises detalhadas para o acompanhamento craniano infantil
            </p>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
