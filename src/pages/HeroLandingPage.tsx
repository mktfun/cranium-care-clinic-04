
import React from "react";
import { HeroScrollDemo } from "@/components/HeroScrollDemo";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HeroLandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="fixed w-full top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-turquesa">Medikran</span>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium hover:text-turquesa transition-colors">
                Entrar
              </Link>
              <Link to="/registro" className="text-sm font-medium bg-turquesa hover:bg-turquesa/90 text-white px-4 py-2 rounded-md transition-colors">
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <HeroScrollDemo />
        
        <section className="py-16 px-4 container mx-auto">
          <div className="text-center mb-12">
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
      </main>
      
      <footer className="bg-gray-100 dark:bg-gray-900 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">© 2025 Medikran. Todos os direitos reservados.</p>
            <div className="flex space-x-6">
              <Link to="/termos" className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquesa">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquesa">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
