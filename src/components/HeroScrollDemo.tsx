
"use client";

import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MedikranFeatures } from "@/components/MedikranFeatures";
import { MedikranTestimonials } from "@/components/MedikranTestimonials";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden">
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
        <div className="flex items-center justify-center h-full">
          <img 
            src="/lovable-uploads/1c64556f-1265-455b-bd7b-b264f9ea1265.png" 
            alt="Medikran Dashboard Preview" 
            className="mx-auto rounded-2xl object-contain h-full max-w-full" 
            draggable={false} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 dark:from-black/20 to-transparent rounded-2xl flex flex-col items-center justify-end pb-10">
            
          </div>
        </div>
      </ContainerScroll>
      
      <div className="container mx-auto px-4 -mt-12 mb-20 pt-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Como Funciona o Medikran
        </h2>
        <MedikranFeatures />
      </div>

      {/* Testimonials Section */}
      <div className="py-16">
        <MedikranTestimonials />
      </div>
      
      {/* Why Choose Medikran Section */}
      <section className="py-20 px-4 container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Por que escolher o Medikran?</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Nossa plataforma oferece ferramentas avançadas para profissionais de saúde realizarem medições cranianas precisas e acompanhamento detalhado.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Medições Precisas</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Ferramentas de medição avançadas para avaliação de parâmetros cranianos com precisão clínica.
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Acompanhamento Completo</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Histórico detalhado e visualização do progresso das medições ao longo do tempo.
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Relatórios Detalhados</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Geração de relatórios profissionais para compartilhar com pacientes e outros profissionais.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
