
"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Activity, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";

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
          {/* Dashboard preview image - mantido como estava */}
          <img
            src="/lovable-uploads/1c64556f-1265-455b-bd7b-b264f9ea1265.png"
            alt="Medikran Dashboard Preview"
            className="mx-auto rounded-2xl object-contain h-[50%] max-w-full"
            draggable={false}
          />
          
          {/* Novo carousel de recursos */}
          <div className="w-full max-w-4xl pt-8 pb-4">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {recursos.map((recurso, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <Card className="border border-gray-200 dark:border-gray-800">
                          <CardContent className="flex flex-col items-center p-6">
                            <div className={`rounded-full p-4 mb-4 ${recurso.color.replace('text-', 'bg-').replace('500', '100')}`}>
                              <recurso.icon className={`h-8 w-8 ${recurso.color}`} />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{recurso.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                              {recurso.description}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 lg:-left-12" />
              <CarouselNext className="right-0 lg:-right-12" />
            </Carousel>
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
