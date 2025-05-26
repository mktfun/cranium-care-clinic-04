
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Ruler, Brain, TrendingUp, FileText } from "lucide-react";

export function MedikranBentoFeatures() {
  const features = [
    {
      title: "Medições Precisas",
      description:
        "Realize medições cranianas precisas com nossa tecnologia avançada de análise de imagens.",
      skeleton: <SkeletonMedicoes />,
      className:
        "col-span-1 md:col-span-4 lg:col-span-4 border-b md:border-r dark:border-neutral-800",
    },
    {
      title: "Análise Inteligente",
      description:
        "IA avançada para detectar e analisar assimetrias cranianas automaticamente.",
      skeleton: <SkeletonAnalise />,
      className: "col-span-1 md:col-span-2 lg:col-span-2 border-b dark:border-neutral-800",
    },
    {
      title: "Acompanhamento Evolutivo",
      description:
        "Monitore o progresso do paciente ao longo do tempo com gráficos detalhados.",
      skeleton: <SkeletonProgresso />,
      className:
        "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-r dark:border-neutral-800",
    },
    {
      title: "Relatórios Profissionais",
      description:
        "Gere relatórios médicos completos e personalizados para cada paciente.",
      skeleton: <SkeletonRelatorios />,
      className: "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-none",
    },
  ];

  return (
    <div className="relative z-20 py-10 lg:py-20 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
          Recursos Avançados para
          <span className="text-turquesa"> Medição Craniana</span>
        </h4>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          Do diagnóstico ao acompanhamento, o Medikran oferece todas as ferramentas necessárias para o cuidado craniano pediátrico especializado.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-neutral-500 text-center font-normal dark:text-neutral-300",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonMedicoes = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-5 mx-auto bg-white dark:bg-neutral-900 shadow-2xl group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          <img
            src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2070&auto=format&fit=crop"
            alt="Medição craniana"
            className="h-full w-full aspect-square object-cover object-center rounded-sm"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Ruler className="w-16 h-16 text-turquesa opacity-80" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};

export const SkeletonAnalise = () => {
  return (
    <div className="relative flex flex-col items-center justify-center p-8 gap-10 h-full overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="flex items-center justify-center"
      >
        <div className="relative">
          <Brain className="w-20 h-20 text-turquesa" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            className="h-8 bg-turquesa/20 rounded"
          />
        ))}
      </div>
    </div>
  );
};

export const SkeletonProgresso = () => {
  const dataPoints = [
    { x: 0, y: 60 },
    { x: 1, y: 45 },
    { x: 2, y: 35 },
    { x: 3, y: 25 },
    { x: 4, y: 20 },
    { x: 5, y: 15 },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center p-8 h-full">
      <div className="w-full h-32 relative">
        <svg viewBox="0 0 200 80" className="w-full h-full">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00CEC9" />
              <stop offset="100%" stopColor="#0984E3" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[...Array(5)].map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={16 + i * 16}
              x2="200"
              y2={16 + i * 16}
              stroke="#e5e7eb"
              strokeWidth="0.5"
              opacity="0.5"
            />
          ))}
          
          {/* Line chart */}
          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            points={dataPoints.map(point => `${point.x * 40},${point.y}`).join(' ')}
          />
          
          {/* Data points */}
          {dataPoints.map((point, i) => (
            <motion.circle
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.2 + 0.5, duration: 0.3 }}
              cx={point.x * 40}
              cy={point.y}
              r="3"
              fill="#00CEC9"
            />
          ))}
        </svg>
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        <TrendingUp className="w-5 h-5 text-green-500" />
        <span className="text-sm text-green-600 font-medium">Melhora de 75%</span>
      </div>
    </div>
  );
};

export const SkeletonRelatorios = () => {
  return (
    <div className="relative flex flex-col items-center justify-center p-8 h-full">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 border">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-turquesa" />
            <div>
              <h4 className="font-semibold text-sm">Relatório Médico</h4>
              <p className="text-xs text-gray-500">João Silva - 8 meses</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            
            <div className="flex gap-2 mt-4">
              <div className="w-8 h-8 bg-turquesa/20 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-turquesa">CI</span>
              </div>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">CVA</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
