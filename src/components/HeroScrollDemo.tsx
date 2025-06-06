
"use client";

import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MedikranTestimonials } from "@/components/MedikranTestimonials";
import { MedikranBentoFeatures } from "@/components/MedikranBentoFeatures";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-[500px] pt-20 py-0">
      <ContainerScroll titleComponent={
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
      }>
        <div className="flex items-center justify-center h-full">
          <img 
            src="/lovable-uploads/1c64556f-1265-455b-bd7b-b264f9ea1265.png" 
            alt="Medikran Dashboard Preview" 
            className="mx-auto rounded-2xl object-contain h-full max-w-full" 
            draggable={false} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 dark:from-black/20 to-transparent rounded-2xl flex flex-col items-center justify-end pb-10"></div>
        </div>
      </ContainerScroll>

      {/* New Bento Grid Features Section */}
      <div className="relative z-10 mb-20">
        <MedikranBentoFeatures />
      </div>

      {/* Testimonials Section */}
      <div className="relative z-10">
        <MedikranTestimonials />
      </div>
    </div>
  );
}
