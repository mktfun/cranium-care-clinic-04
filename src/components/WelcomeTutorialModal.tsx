import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Slide {
  title: string;
  description: React.ReactNode;
  image?: string;
}

const TUTORIAL_SLIDES: Slide[] = [
  {
    title: "Bem-vindo(a) à Cranium Care Clinic!",
    description: (
      <>
        <p className="mb-2">Este aplicativo foi desenhado para ajudar profissionais de saúde a registrar, acompanhar e analisar medições cranianas de pacientes pediátricos.</p>
        <p>Vamos fazer um tour rápido pelas principais funcionalidades.</p>
      </>
    ),
  },
  {
    title: "Registrando um Novo Paciente",
    description: (
      <>
        <p className="mb-2">Para começar, você pode registrar um novo paciente clicando no menu "Pacientes" e depois no botão "Registrar Paciente".</p>
        <p>Preencha os dados solicitados, como nome, data de nascimento e informações do responsável.</p>
      </>
    ),
  },
  {
    title: "Realizando Medições",
    description: (
      <>
        <p className="mb-2">Após registrar um paciente, você pode adicionar medições cranianas. Acesse o perfil do paciente e clique em "Nova Medição".</p>
        <p>Insira os valores como comprimento, largura e diagonais. O sistema calculará automaticamente os índices importantes como IC e CVAI.</p>
      </>
    ),
  },
  {
    title: "Analisando a Evolução",
    description: (
      <>
        <p className="mb-2">Na tela de detalhes do paciente, você encontrará gráficos que mostram a evolução do Índice Craniano, CVAI, Diagonais e Perímetro Cefálico ao longo do tempo.</p>
        <p>Isso ajuda a visualizar o progresso e a eficácia de qualquer intervenção.</p>
      </>
    ),
  },
  {
    title: "Relatórios e Configurações",
    description: (
      <>
        <p className="mb-2">Você pode gerar relatórios detalhados para cada medição e acessar as configurações do aplicativo no menu lateral.</p>
        <p>Explore o aplicativo para descobrir todas as ferramentas disponíveis!</p>
      </>
    ),
  },
];

const LOCAL_STORAGE_KEY = 'craniumCareTutorialVisto';

export const WelcomeTutorialModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const tutorialVisto = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!tutorialVisto) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < TUTORIAL_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  const slide = TUTORIAL_SLIDES[currentSlide];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        // Se o usuário fechar o modal de outra forma (ex: ESC ou clique fora)
        // considerar como finalizado também para não reaparecer.
        handleFinish();
      }
      setIsOpen(open);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{slide.title}</DialogTitle>
          {slide.image && <img src={slide.image} alt={slide.title} className="my-4 rounded-md" />}
          <DialogDescription asChild>
             <div className="mt-2 text-sm text-muted-foreground">
                {slide.description}
             </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Passo {currentSlide + 1} de {TUTORIAL_SLIDES.length}
          </div>
          <div className="flex gap-2">
            {currentSlide > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}
            {currentSlide < TUTORIAL_SLIDES.length - 1 ? (
              <Button onClick={handleNext} className="bg-turquesa hover:bg-turquesa/90">
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleFinish} className="bg-turquesa hover:bg-turquesa/90">
                Concluir
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

