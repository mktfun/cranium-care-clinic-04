
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Image, AlertCircle, CheckCircle, HelpCircle, X, ZoomIn, ZoomOut, RotateCcw, Save, Download, Maximize, Minimize, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useParams } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { getCranialStatus } from "@/lib/cranial-utils";

// Tipos de dados
interface Point {
  x: number;
  y: number;
  name: string;
  id: string;
}

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  points: Point[];
  view: "superior" | "lateralDireita" | "lateralEsquerda" | "frontal" | "referencia";
  calibrationRatio: number | null; // pixels per mm
  naturalWidth?: number;
  naturalHeight?: number;
}

interface MeasurementResult {
  cr: number | null;
  cvai: number | null;
  measurements: Record<string, number | null>;
  cranialStatus?: {
    asymmetryType: string;
    severityLevel: string;
  };
}

const PONTOS_ANATOMICOS = {
  superior: [
    { id: "g", name: "Glabela (G)" },
    { id: "op", name: "Opistocrânio (Op)" },
    { id: "eur", name: "Eurion Direito (Eu.r)" },
    { id: "eul", name: "Eurion Esquerdo (Eu.l)" },
    { id: "fp1", name: "Ponto Frontal 1 (30° à dir. de G)" },
    { id: "fp2", name: "Ponto Frontal 2 (30° à esq. de G)" },
    { id: "pp1", name: "Ponto Posterior 1 (30° à dir. de Op)" },
    { id: "pp2", name: "Ponto Posterior 2 (30° à esq. de Op)" },
  ],
  lateralDireita: [
    { id: "tr_r", name: "Tragus Direito (Tr.r)" },
    { id: "ex_r", name: "Exocâncio Direito (Ex.r)" },
    { id: "sn_r", name: "Subnasal Direito (Sn.r)" },
    { id: "n_r", name: "Násio Direito (N.r)" },
  ],
  lateralEsquerda: [
    { id: "tr_l", name: "Tragus Esquerdo (Tr.l)" },
    { id: "ex_l", name: "Exocâncio Esquerdo (Ex.l)" },
    { id: "sn_l", name: "Subnasal Esquerdo (Sn.l)" },
    { id: "n_l", name: "Násio Esquerdo (N.l)" },
  ],
  frontal: [
    { id: "en_r", name: "Endocâncio Direito (En.r)" },
    { id: "en_l", name: "Endocâncio Esquerdo (En.l)" },
    { id: "zy_r", name: "Zígio Direito (Zy.r)" },
    { id: "zy_l", name: "Zígio Esquerdo (Zy.l)" },
  ],
  referencia: [
    { id: "ref1", name: "Ponto 1 da Régua" },
    { id: "ref2", name: "Ponto 2 da Régua" },
  ]
};

const VIEW_TABS = [
  { id: "superior", label: "Superior", isRequired: true },
  { id: "referencia", label: "Referência", isRequired: true },
  { id: "lateralDireita", label: "Lat. Direita", isRequired: false },
  { id: "lateralEsquerda", label: "Lat. Esquerda", isRequired: false },
  { id: "frontal", label: "Frontal", isRequired: false },
];

// Classificações de severidade do índice craniano
const classificarIndiceCraniano = (ic: number) => {
  if (ic < 76) return { categoria: "Dolicocefalia", severidade: ic < 70 ? "severa" : ic < 73 ? "moderada" : "leve" };
  if (ic > 81) return { categoria: "Braquicefalia", severidade: ic > 90 ? "severa" : ic > 85 ? "moderada" : "leve" };
  return { categoria: "Normal", severidade: "normal" };
};

// Classificações de severidade do CVAI
const classificarCVAI = (cvai: number) => {
  if (cvai <= 3.5) return { categoria: "Normal", severidade: "normal" };
  if (cvai <= 6.25) return { categoria: "Plagiocefalia", severidade: "leve" };
  if (cvai <= 8.75) return { categoria: "Plagiocefalia", severidade: "moderada" };
  return { categoria: "Plagiocefalia", severidade: "severa" };
};

const MedicaoPorFotoPage: React.FC = () => {
  const { id: pacienteIdParam } = useParams<{ id: string }>();
  const [pacienteNome, setPacienteNome] = useState<string>("Carregando...");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState<string>("superior");
  const [currentPointToMark, setCurrentPointToMark] = useState<string | null>(null);
  const [rulerLengthMm, setRulerLengthMm] = useState<string>("100");
  const [measurementResults, setMeasurementResults] = useState<MeasurementResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true); // Mostrar tutorial na primeira carga
  const [tutorialStep, setTutorialStep] = useState(0);
  const [pacienteIdade, setPacienteIdade] = useState<number | null>(null);

  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const imageRefs = useRef<Record<string, HTMLImageElement | null>>({});

  useEffect(() => {
    const fetchPacienteInfo = async () => {
      if (pacienteIdParam) {
        const { data, error } = await supabase
          .from("pacientes")
          .select("nome, data_nascimento")
          .eq("id", pacienteIdParam)
          .single();
        if (error) {
          console.error("Erro ao buscar dados do paciente:", error);
          setPacienteNome("Paciente não encontrado");
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do paciente.",
            variant: "destructive"
          });
        } else if (data) {
          setPacienteNome(data.nome);
          
          // Calcular idade em meses
          if (data.data_nascimento) {
            const nascimento = new Date(data.data_nascimento);
            const hoje = new Date();
            const idadeMeses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 + 
                             (hoje.getMonth() - nascimento.getMonth());
            setPacienteIdade(idadeMeses);
          }
        }
      }
    };
    fetchPacienteInfo();
  }, [pacienteIdParam]);

  // Verifica se todas as vistas obrigatórias estão carregadas
  const allRequiredViewsUploaded = () => {
    const requiredViews = VIEW_TABS.filter(tab => tab.isRequired).map(tab => tab.id);
    return requiredViews.every(viewId => 
      uploadedImages.some(img => img.view === viewId)
    );
  };

  // Verifica se todos os pontos obrigatórios estão marcados
  const allRequiredPointsMarked = () => {
    if (!allRequiredViewsUploaded()) return false;
    
    // Check superior view points
    const superiorImg = uploadedImages.find(img => img.view === "superior");
    const requiredSuperiorPoints = ["g", "op", "eur", "eul"];
    const allSuperiorPointsMarked = superiorImg && 
      requiredSuperiorPoints.every(pointId => 
        superiorImg.points.some(p => p.id === pointId)
      );
    
    // Check reference view points
    const refImg = uploadedImages.find(img => img.view === "referencia");
    const refPointsMarked = refImg && 
      ["ref1", "ref2"].every(pointId => 
        refImg.points.some(p => p.id === pointId)
      );
    
    // Optional CVAI points (only if they started marking them)
    const cvaiPoints = ["fp1", "fp2", "pp1", "pp2"];
    const someCvaiPointsMarked = superiorImg && cvaiPoints.some(pointId => superiorImg.points.some(p => p.id === pointId));
    const allCvaiPointsMarked = !someCvaiPointsMarked || (superiorImg && 
      cvaiPoints.every(pointId => superiorImg.points.some(p => p.id === pointId)));
    
    return !!allSuperiorPointsMarked && !!refPointsMarked && allCvaiPointsMarked;
  };

  // Verifica se a calibração foi realizada
  const isCalibrated = () => {
    const refImg = uploadedImages.find(img => img.view === "referencia");
    return refImg && refImg.calibrationRatio !== null;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, view: UploadedImage["view"]) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      const imageId = uuidv4();
      const img = new window.Image();
      img.onload = () => {
        setUploadedImages(prev => [
          ...prev.filter(imgState => imgState.view !== view),
          { id: imageId, file, url: imageUrl, points: [], view, calibrationRatio: null, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }
        ]);

        toast({
          title: "Imagem carregada",
          description: `Vista ${view === "superior" ? "superior" : 
                         view === "referencia" ? "de referência" : 
                         view === "lateralDireita" ? "lateral direita" : 
                         view === "lateralEsquerda" ? "lateral esquerda" : 
                         "frontal"} carregada com sucesso.`,
          variant: "success"
        });
      };
      img.src = imageUrl;
      setActiveImageId(imageId);
      setCurrentPointToMark(PONTOS_ANATOMICOS[view][0]?.id || null);
      
      // Se for a primeira imagem carregada e o tutorial ainda estiver ativo, avançar o tutorial
      if (showTutorial && tutorialStep === 1) {
        setTutorialStep(2);
      }
    }
  };

  const drawCanvas = useCallback((imageId: string, targetCanvas?: HTMLCanvasElement, customZoom: number = zoomLevel) => {
    const canvas = targetCanvas || canvasRefs.current[imageId];
    const imgElement = imageRefs.current[imageId]; // This ref might not be available for offscreen canvas
    const imageState = uploadedImages.find(img => img.id === imageId);

    if (canvas && imageState && (imgElement?.complete || targetCanvas)) { // For offscreen, imgElement might not be used directly
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const sourceImgWidth = imageState.naturalWidth || canvas.width / customZoom; // Use stored naturalWidth
      const sourceImgHeight = imageState.naturalHeight || canvas.height / customZoom; // Use stored naturalHeight

      canvas.width = sourceImgWidth * customZoom;
      canvas.height = sourceImgHeight * customZoom;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw image from URL for offscreen canvas, or from imageRef for onscreen
      const tempImg = new window.Image();
      tempImg.onload = () => {
          ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
          
          // Draw reference lines for the 30° diagonals in superior view if we have G and Op points
          if (imageState.view === "superior") {
            const gPoint = imageState.points.find(p => p.id === "g");
            const opPoint = imageState.points.find(p => p.id === "op");
            
            if (gPoint && opPoint) {
              // Calculate center of G-Op line
              const centerX = (gPoint.x + opPoint.x) / 2;
              const centerY = (gPoint.y + opPoint.y) / 2;
              
              // Calculate angle of G-Op line
              const angle = Math.atan2(opPoint.y - gPoint.y, opPoint.x - gPoint.x);
              
              // Draw G-Op line
              ctx.beginPath();
              ctx.moveTo(gPoint.x * customZoom, gPoint.y * customZoom);
              ctx.lineTo(opPoint.x * customZoom, opPoint.y * customZoom);
              ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
              ctx.lineWidth = 1 * customZoom;
              ctx.stroke();
              
              // Draw 30° diagonal guidelines if we're currently marking a diagonal point
              if (currentPointToMark && ["fp1", "fp2", "pp1", "pp2"].includes(currentPointToMark)) {
                const diagonalLength = Math.sqrt(Math.pow(opPoint.x - gPoint.x, 2) + Math.pow(opPoint.y - gPoint.y, 2)) * 0.7;
                
                // Right diagonals (30° clockwise from G and Op)
                ctx.beginPath();
                ctx.moveTo(gPoint.x * customZoom, gPoint.y * customZoom);
                ctx.lineTo(
                  (gPoint.x + diagonalLength * Math.cos(angle + Math.PI/6)) * customZoom, 
                  (gPoint.y + diagonalLength * Math.sin(angle + Math.PI/6)) * customZoom
                );
                ctx.strokeStyle = currentPointToMark === "fp1" ? "rgba(255, 0, 0, 0.7)" : "rgba(0, 255, 0, 0.5)";
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(opPoint.x * customZoom, opPoint.y * customZoom);
                ctx.lineTo(
                  (opPoint.x + diagonalLength * Math.cos(angle - Math.PI + Math.PI/6)) * customZoom, 
                  (opPoint.y + diagonalLength * Math.sin(angle - Math.PI + Math.PI/6)) * customZoom
                );
                ctx.strokeStyle = currentPointToMark === "pp1" ? "rgba(255, 0, 0, 0.7)" : "rgba(0, 255, 0, 0.5)";
                ctx.stroke();
                
                // Left diagonals (30° counterclockwise from G and Op)
                ctx.beginPath();
                ctx.moveTo(gPoint.x * customZoom, gPoint.y * customZoom);
                ctx.lineTo(
                  (gPoint.x + diagonalLength * Math.cos(angle - Math.PI/6)) * customZoom, 
                  (gPoint.y + diagonalLength * Math.sin(angle - Math.PI/6)) * customZoom
                );
                ctx.strokeStyle = currentPointToMark === "fp2" ? "rgba(255, 0, 0, 0.7)" : "rgba(0, 255, 0, 0.5)";
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(opPoint.x * customZoom, opPoint.y * customZoom);
                ctx.lineTo(
                  (opPoint.x + diagonalLength * Math.cos(angle - Math.PI - Math.PI/6)) * customZoom, 
                  (opPoint.y + diagonalLength * Math.sin(angle - Math.PI - Math.PI/6)) * customZoom
                );
                ctx.strokeStyle = currentPointToMark === "pp2" ? "rgba(255, 0, 0, 0.7)" : "rgba(0, 255, 0, 0.5)";
                ctx.stroke();
              }
            }
          }
          
          // Draw points
          imageState.points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x * customZoom, point.y * customZoom, 5 * customZoom, 0, 2 * Math.PI);
            ctx.fillStyle = currentPointToMark === point.id && !targetCanvas ? "rgba(255, 0, 0, 0.7)" : "rgba(0, 255, 0, 0.7)";
            ctx.fill();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1 * customZoom;
            ctx.stroke();
            ctx.fillStyle = "black";
            ctx.font = `${10 * customZoom}px Arial`;
            ctx.fillText(PONTOS_ANATOMICOS[imageState.view].find(p => p.id === point.id)?.name || point.id, point.x * customZoom + 8 * customZoom, point.y * customZoom - 8 * customZoom);
          });
          
          // Draw calibration information if view is reference and calibrated
          if (imageState.view === "referencia" && imageState.calibrationRatio !== null) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(10, 10, 250 * customZoom, 40 * customZoom);
            ctx.fillStyle = "white";
            ctx.font = `${12 * customZoom}px Arial`;
            ctx.fillText(`Calibração: ${imageState.calibrationRatio.toFixed(2)} pixels/mm`, 20, 30);
            ctx.fillText(`Comprimento da régua: ${rulerLengthMm} mm`, 20, 50);
          }
      };
      tempImg.src = imageState.url; // Always use the URL for drawing
    }
  }, [uploadedImages, currentPointToMark, zoomLevel, rulerLengthMm]);

  useEffect(() => {
    if (activeImageId) {
      const imgState = uploadedImages.find(img => img.id === activeImageId);
      if (imgState && imgState.naturalWidth) { // Ensure naturalWidth is available
         drawCanvas(activeImageId);
      }
    }
  }, [activeImageId, uploadedImages, drawCanvas, zoomLevel]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>, imageId: string) => {
    const canvas = canvasRefs.current[imageId];
    const imageState = uploadedImages.find(img => img.id === imageId);
    if (!canvas || !imageState || !currentPointToMark) return;

    const rect = canvas.getBoundingClientRect();
    // Adjust for actual displayed size vs natural size, then by zoom
    const scaleX = canvas.width / (imageState.naturalWidth || canvas.width);
    const scaleY = canvas.height / (imageState.naturalHeight || canvas.height);

    const x = (event.clientX - rect.left) / scaleX / zoomLevel;
    const y = (event.clientY - rect.top) / scaleY / zoomLevel;

    const pointName = PONTOS_ANATOMICOS[imageState.view].find(p => p.id === currentPointToMark)?.name || currentPointToMark;

    setUploadedImages(prev =>
      prev.map(img =>
        img.id === imageId
          ? {
              ...img,
              points: img.points.filter(p => p.id !== currentPointToMark).concat([{ x, y, name: pointName, id: currentPointToMark }])
            }
          : img
      )
    );
    
    toast({
      title: "Ponto marcado",
      description: `${pointName} foi marcado com sucesso.`,
      variant: "success"
    });

    // Avançar automaticamente para o próximo ponto
    const currentIndex = PONTOS_ANATOMICOS[imageState.view].findIndex(p => p.id === currentPointToMark);
    if (currentIndex + 1 < PONTOS_ANATOMICOS[imageState.view].length) {
      setCurrentPointToMark(PONTOS_ANATOMICOS[imageState.view][currentIndex + 1].id);
    } else {
      setCurrentPointToMark(null);
      
      // Se for a primeira imagem no tutorial, avançar para o próximo passo
      if (showTutorial && tutorialStep === 2) {
        setTutorialStep(3);
      }
    }
  };

  const handleCalibrate = (imageId: string) => {
    const imageState = uploadedImages.find(img => img.id === imageId);
    if (!imageState || imageState.view !== "referencia" || imageState.points.length < 2) {
      setError("Marque os dois pontos na régua de referência primeiro.");
      toast({
        title: "Erro na calibração",
        description: "Marque os dois pontos na régua de referência primeiro.",
        variant: "destructive"
      });
      return;
    }
    const p1 = imageState.points.find(p => p.id === "ref1");
    const p2 = imageState.points.find(p => p.id === "ref2");
    const lengthMm = parseFloat(rulerLengthMm);

    if (p1 && p2 && !isNaN(lengthMm) && lengthMm > 0) {
      const distancePixels = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const ratio = distancePixels / lengthMm;
      setUploadedImages(prev => prev.map(img => img.id === imageId ? { ...img, calibrationRatio: ratio } : img));
      setError(null);
      
      toast({
        title: "Calibração concluída",
        description: `Fator de calibração: ${ratio.toFixed(2)} pixels/mm.`,
        variant: "success"
      });
      
      // Se for o passo de calibração no tutorial, avançar
      if (showTutorial && tutorialStep === 4) {
        setTutorialStep(5);
      }
    } else {
      setError("Erro na calibração. Verifique os pontos e o comprimento da régua.");
      toast({
        title: "Erro na calibração",
        description: "Verifique os pontos e o comprimento da régua.",
        variant: "destructive"
      });
    }
  };

  const calculateMeasurements = () => {
    const superiorImg = uploadedImages.find(img => img.view === "superior");
    const refImg = uploadedImages.find(img => img.view === "referencia" && img.calibrationRatio);

    if (!superiorImg || !refImg || !refImg.calibrationRatio) {
      setError("Imagens da vista superior e de referência (calibrada) são necessárias.");
      toast({
        title: "Faltam imagens",
        description: "Imagens da vista superior e de referência (calibrada) são necessárias.",
        variant: "destructive"
      });
      return;
    }
    const calibRatio = refImg.calibrationRatio;

    const getDist = (p1Id: string, p2Id: string, img: UploadedImage): number | null => {
      const p1 = img.points.find(p => p.id === p1Id);
      const p2 = img.points.find(p => p.id === p2Id);
      if (p1 && p2 && calibRatio) {
        const pixelDist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        return pixelDist / calibRatio;
      }
      return null;
    };

    const G_Op = getDist("g", "op", superiorImg);
    const EuR_EuL = getDist("eur", "eul", superiorImg);
    
    // Check if diagonal points exist
    const hasAllDiagonalPoints = ["fp1", "fp2", "pp1", "pp2"].every(
      pointId => superiorImg.points.some(p => p.id === pointId)
    );
    
    let Diag1 = null;
    let Diag2 = null;
    
    if (hasAllDiagonalPoints) {
      Diag1 = getDist("fp1", "pp2", superiorImg);
      Diag2 = getDist("fp2", "pp1", superiorImg);
    }

    let cr = null;
    if (EuR_EuL && G_Op && G_Op > 0) {
      cr = (EuR_EuL / G_Op) * 100;
    }

    let cvai = null;
    if (Diag1 && Diag2 && Math.max(Diag1, Diag2) > 0) {
      cvai = (Math.abs(Diag1 - Diag2) / Math.max(Diag1, Diag2)) * 100;
    }
    
    // Determinar classificação
    const cranialStatus = cr !== null ? getCranialStatus(cr, cvai || 0) : undefined;
    
    const result = {
      cr: cr ? parseFloat(cr.toFixed(2)) : null,
      cvai: cvai ? parseFloat(cvai.toFixed(2)) : null,
      measurements: {
        "Comprimento (G-Op)": G_Op ? parseFloat(G_Op.toFixed(2)) : null,
        "Largura (EuR-EuL)": EuR_EuL ? parseFloat(EuR_EuL.toFixed(2)) : null,
        ...(hasAllDiagonalPoints ? {
          "Diagonal 1 (Fp1-Pp2)": Diag1 ? parseFloat(Diag1.toFixed(2)) : null,
          "Diagonal 2 (Fp2-Pp1)": Diag2 ? parseFloat(Diag2.toFixed(2)) : null,
          "Diferença de Diagonais": Diag1 && Diag2 ? parseFloat(Math.abs(Diag1 - Diag2).toFixed(2)) : null
        } : {})
      },
      cranialStatus
    };
    
    setMeasurementResults(result);
    setError(null);
    
    toast({
      title: "Medições calculadas",
      description: `IC: ${result.cr?.toFixed(2)}%, ${result.cvai ? `CVAI: ${result.cvai?.toFixed(2)}%` : 'CVAI não calculado (faltam pontos diagonais)'}`,
      variant: "success"
    });
    
    // Se for o último passo do tutorial, finalizá-lo
    if (showTutorial && tutorialStep === 5) {
      setTutorialStep(6);
    }
  };

  const saveMeasurementToDatabase = async () => {
    if (!measurementResults || !pacienteIdParam) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados. Verifique se todas as medições foram realizadas.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Obter ID do usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Preparar dados para inserir na tabela medicoes
      const newMeasurement = {
        paciente_id: pacienteIdParam,
        user_id: user.id,
        data: new Date().toISOString().split('T')[0],
        comprimento: measurementResults.measurements["Comprimento (G-Op)"],
        largura: measurementResults.measurements["Largura (EuR-EuL)"],
        diagonal_d: measurementResults.measurements["Diagonal 1 (Fp1-Pp2)"] || null,
        diagonal_e: measurementResults.measurements["Diagonal 2 (Fp2-Pp1)"] || null,
        diferenca_diagonais: measurementResults.measurements["Diferença de Diagonais"] || null,
        indice_craniano: measurementResults.cr,
        cvai: measurementResults.cvai,
        status: measurementResults.cranialStatus?.asymmetryType || "Normal",
        observacoes: "Medição realizada por foto",
        recomendacoes: getRecomendacoes(
          measurementResults.cranialStatus?.asymmetryType || "Normal",
          measurementResults.cranialStatus?.severityLevel || "normal",
          pacienteIdade || 0,
          measurementResults.cr || 0
        )
      };
      
      // Inserir na tabela medicoes
      const { data, error } = await supabase
        .from('medicoes')
        .insert([newMeasurement])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Criar notificação para o usuário
      await supabase
        .from('notificacoes')
        .insert([{
          user_id: user.id,
          title: "Nova medição craniana salva",
          message: `Medição por foto realizada para ${pacienteNome}`,
          link: `/pacientes/${pacienteIdParam}/prontuario`
        }]);
      
      toast({
        title: "Medição salva",
        description: "Os dados foram salvos com sucesso no prontuário do paciente.",
        variant: "success"
      });
      
      setShowSaveConfirmDialog(false);
      
    } catch (error) {
      console.error("Erro ao salvar medição:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRecomendacoes = (tipo: string, severidade: string, idadeMeses: number, ic: number): string[] => {
    const recomendacoes: string[] = [];
    
    if (tipo === "Normal") {
      recomendacoes.push("Manter acompanhamento regular do desenvolvimento craniano.");
      return recomendacoes;
    }
    
    // Recomendações por severidade
    if (severidade === "leve" || severidade === "normal") {
      recomendacoes.push("Reposicionamento ativo durante períodos de vigília.");
      recomendacoes.push("Exercícios de fisioterapia para fortalecimento cervical.");
      
      if (idadeMeses <= 6) {
        recomendacoes.push("Priorizar tempo de barriga para baixo (tummy time) supervisionado.");
      }
    }
    
    if (severidade === "moderada") {
      recomendacoes.push("Programa intensivo de reposicionamento e fisioterapia.");
      
      if (idadeMeses >= 6 && idadeMeses <= 12) {
        recomendacoes.push("Avaliar necessidade de órtese craniana nas próximas 4-6 semanas se não houver melhora.");
      }
    }
    
    if (severidade === "severa") {
      recomendacoes.push("Encaminhamento para avaliação especializada de órtese craniana.");
      
      if (tipo === "Braquicefalia" && ic >= 95) {
        recomendacoes.push("Considerar avaliação neurocirúrgica.");
      }
      
      if ((tipo === "Plagiocefalia" || tipo === "Misto") && idadeMeses <= 12) {
        recomendacoes.push("Iniciar tratamento com capacete ortopédico o mais breve possível.");
      }
    }
    
    // Recomendações específicas por tipo
    if (tipo === "Braquicefalia" || tipo === "Misto") {
      recomendacoes.push("Evitar longos períodos na posição supina (de costas).");
      recomendacoes.push("Alternar posição da cabeça durante o sono.");
    }
    
    if (tipo === "Dolicocefalia") {
      recomendacoes.push("Evitar posicionamento lateral prolongado.");
      if (idadeMeses <= 6) {
        recomendacoes.push("Avaliar possível prematuridade e ajustar expectativas de desenvolvimento.");
      }
    }
    
    if (tipo === "Plagiocefalia" || tipo === "Misto") {
      recomendacoes.push("Alternar lado da cabeça durante alimentação e sono.");
      recomendacoes.push("Verificar possível torcicolo ou preferência posicional.");
    }
    
    return recomendacoes;
  };

  const handleGenerateReport = async () => {
    if (!measurementResults) {
      alert("Calcule as medidas primeiro.");
      return;
    }

    let reportHtml = `
      <html>
        <head>
          <title>Relatório de Medição Craniana por Foto</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1, h2, h3 { color: #1a237e; }
            .container { width: 800px; margin: auto; }
            .section { margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #f9f9f9; }
            .section h2 { margin-top: 0; border-bottom: 2px solid #1a237e; padding-bottom: 5px;}
            .image-container { text-align: center; margin-bottom: 15px; }
            .image-container img { max-width: 100%; border: 1px solid #ccc; margin-bottom: 5px; }
            .image-container p { font-size: 0.9em; color: #555; margin-top:0; }
            .results-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .results-table th, .results-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .results-table th { background-color: #e8eaf6; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 0.9em; margin-left: 5px; color: white; }
            .badge-normal { background-color: #4caf50; }
            .badge-leve { background-color: #ffb74d; }
            .badge-moderada { background-color: #ff9800; }
            .badge-severa { background-color: #f44336; }
            .recommendations { list-style-type: disc; padding-left: 20px; }
            .recommendations li { margin-bottom: 5px; }
            .print-button { display: block; width: 150px; margin: 20px auto; padding: 10px; background-color: #1a237e; color: white; text-align: center; border-radius: 5px; text-decoration: none; cursor: pointer; }
            @media print {
              body { margin: 0; color: black; }
              .container { width: 100%; margin: 0; box-shadow: none; border: none; }
              .section { border: none; padding: 10px 0; background-color: white; }
              .print-button { display: none; }
              @page { margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1>Relatório de Medição Craniana por Foto</h1>
            </div>
            <div class="section">
              <h2>Informações do Paciente</h2>
              <p><strong>Paciente:</strong> ${pacienteNome || pacienteIdParam}</p>
              <p><strong>Data da Medição:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
              ${pacienteIdade !== null ? `<p><strong>Idade:</strong> ${pacienteIdade} ${pacienteIdade === 1 ? 'mês' : 'meses'}</p>` : ''}
            </div>
            
            <div class="section">
              <h2>Resultados dos Índices</h2>
              <table class="results-table">
                <tr><th>Índice</th><th>Valor</th><th>Classificação</th></tr>
                <tr>
                  <td>Índice Craniano (CR)</td>
                  <td>${measurementResults.cr !== null ? measurementResults.cr.toFixed(2) + "%" : "N/A"}</td>
                  <td>
                    ${measurementResults.cr !== null ? `
                      ${measurementResults.cranialStatus?.asymmetryType === "Normal" || measurementResults.cranialStatus?.asymmetryType === "Plagiocefalia" ? 
                        'Normal' : measurementResults.cranialStatus?.asymmetryType}
                      ${measurementResults.cranialStatus?.asymmetryType !== "Normal" ? `
                        <span class="badge badge-${measurementResults.cranialStatus?.severityLevel || 'normal'}">
                          ${measurementResults.cranialStatus?.severityLevel === "normal" ? "leve" : measurementResults.cranialStatus?.severityLevel}
                        </span>` : 
                        '<span class="badge badge-normal">normal</span>'}
                    ` : "N/A"}
                  </td>
                </tr>
                <tr>
                  <td>Índice de Assimetria (CVAI)</td>
                  <td>${measurementResults.cvai !== null ? measurementResults.cvai.toFixed(2) + "%" : "N/A"}</td>
                  <td>
                    ${measurementResults.cvai !== null ? `
                      ${measurementResults.cvai <= 3.5 ? 'Normal' : 'Plagiocefalia'}
                      <span class="badge badge-${
                        measurementResults.cvai <= 3.5 ? 'normal' : 
                        measurementResults.cvai <= 6.25 ? 'leve' : 
                        measurementResults.cvai <= 8.75 ? 'moderada' : 'severa'
                      }">
                        ${
                          measurementResults.cvai <= 3.5 ? 'normal' : 
                          measurementResults.cvai <= 6.25 ? 'leve' : 
                          measurementResults.cvai <= 8.75 ? 'moderada' : 'severa'
                        }
                      </span>
                    ` : "N/A"}
                  </td>
                </tr>
              </table>
            </div>

            <div class="section">
              <h2>Medidas Detalhadas (mm)</h2>
              <table class="results-table">
                <tr><th>Medida</th><th>Valor (mm)</th></tr>`;
    for (const [key, value] of Object.entries(measurementResults.measurements)) {
      reportHtml += `<tr><td>${key}</td><td>${value !== null ? value.toFixed(2) : "N/A"}</td></tr>`;
    }
    reportHtml += `</table></div>`;

    // Adicionar seção de recomendações
    if (measurementResults.cranialStatus) {
      const recomendacoes = getRecomendacoes(
        measurementResults.cranialStatus.asymmetryType,
        measurementResults.cranialStatus.severityLevel,
        pacienteIdade || 0,
        measurementResults.cr || 0
      );
      
      reportHtml += `
      <div class="section">
        <h2>Recomendações</h2>
        <p>Baseado nas medições e na idade do paciente, as seguintes recomendações são sugeridas:</p>
        <ul class="recommendations">
          ${recomendacoes.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>`;
    }

    reportHtml += `<div class="section"><h2>Imagens Utilizadas e Pontos Marcados</h2>`;
    for (const imgState of uploadedImages) {
      if (imgState.naturalWidth && imgState.naturalHeight) {
        const offscreenCanvas = document.createElement("canvas");
        // Draw on offscreen canvas with a fixed reasonable zoom for the report
        drawCanvas(imgState.id, offscreenCanvas, 1); // Using zoom 1 for report, adjust if needed
        const dataUrl = offscreenCanvas.toDataURL("image/png");
        reportHtml += `
          <div class="image-container">
            <h3>Vista: ${imgState.view.charAt(0).toUpperCase() + imgState.view.slice(1).replace(/([A-Z])/g, ' $1').trim()}</h3>
            <img src="${dataUrl}" alt="Vista ${imgState.view}"/>
            ${imgState.view === 'referencia' && imgState.calibrationRatio ? `<p>Calibração: ${imgState.calibrationRatio.toFixed(2)} px/mm (Régua: ${rulerLengthMm}mm)</p>` : ''}
          </div>`;
      }
    }
    reportHtml += `</div>`;
    reportHtml += `<button class="print-button" onclick="window.print()">Imprimir Relatório</button></div></body></html>`;

    const reportWindow = window.open("", "_blank");
    if (reportWindow) {
      reportWindow.document.write(reportHtml);
      reportWindow.document.close();
    } else {
      alert("Não foi possível abrir a janela de relatório. Verifique as configurações do seu navegador.");
    }
  };

  const activeImageState = uploadedImages.find(img => img.id === activeImageId);

  const toggleFullScreen = () => {
    const elem = document.getElementById("medicao-foto-container");
    if (!isFullScreen) {
      if (elem?.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`));
        setIsFullScreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Componente de tutorial passo a passo
  const TutorialOverlay = () => {
    if (!showTutorial) return null;
    
    let content: JSX.Element;
    
    switch (tutorialStep) {
      case 0: // Introdução
        content = (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2">Bem-vindo à Medição por Foto</h3>
            <p className="mb-4">Este tutorial vai te guiar no processo de medição craniana utilizando fotografias. Vamos passar por todas as etapas necessárias.</p>
            <div className="flex justify-between">
              <Button onClick={() => setShowTutorial(false)} variant="outline">Pular tutorial</Button>
              <Button onClick={() => setTutorialStep(1)}>Próximo</Button>
            </div>
          </div>
        );
        break;
      case 1: // Upload de imagens
        content = (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2">Passo 1: Upload das fotos</h3>
            <p className="mb-4">Comece fazendo o upload da foto da Vista Superior da cabeça (de cima para baixo) e da foto de Referência (com uma régua ou objeto de tamanho conhecido).</p>
            <div className="flex justify-between">
              <Button onClick={() => setTutorialStep(0)} variant="outline">Voltar</Button>
              <Button onClick={() => setTutorialStep(2)} variant="outline">Pular</Button>
            </div>
          </div>
        );
        break;
      case 2: // Marcação dos pontos
        content = (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2">Passo 2: Marcação dos pontos anatômicos</h3>
            <p className="mb-4">Agora marque os pontos anatômicos clicando na imagem onde cada ponto deve estar. O sistema indicará qual ponto marcar a cada momento.</p>
            <div className="flex justify-between">
              <Button onClick={() => setTutorialStep(1)} variant="outline">Voltar</Button>
              <Button onClick={() => setTutorialStep(3)} variant="outline">Pular</Button>
            </div>
          </div>
        );
        break;
      case 3: // Referência e calibração
        content = (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2">Passo 3: Marque e calibre a referência</h3>
            <p className="mb-4">Vá para a aba 'Referência', faça upload da foto com a régua e marque os dois pontos extremos. Em seguida, informe o comprimento da régua (geralmente 100mm) e clique em 'Calibrar'.</p>
            <div className="flex justify-between">
              <Button onClick={() => setTutorialStep(2)} variant="outline">Voltar</Button>
              <Button onClick={() => {
                setActiveTabId("referencia");
                setTutorialStep(4);
              }}>Ir para Referência</Button>
            </div>
          </div>
        );
        break;
      case 4: // Cálculo
        content = (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2">Passo 4: Calibração</h3>
            <p className="mb-4">Após marcar os pontos de referência, informe o comprimento da régua e clique em 'Calibrar Vista de Referência'.</p>
            <div className="flex justify-between">
              <Button onClick={() => setTutorialStep(3)} variant="outline">Voltar</Button>
              <Button onClick={() => setTutorialStep(5)} variant="outline">Pular</Button>
            </div>
          </div>
        );
        break;
      case 5: // Resultados
        content = (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2">Passo 5: Calcule os índices</h3>
            <p className="mb-4">Agora que todos os pontos necessários estão marcados e a calibração foi feita, clique em 'Calcular Índices CR e CVAI'.</p>
            <div className="flex justify-between">
              <Button onClick={() => setTutorialStep(4)} variant="outline">Voltar</Button>
              <Button onClick={() => setTutorialStep(6)} variant="outline">Pular</Button>
            </div>
          </div>
        );
        break;
      case 6: // Finalização
        content = (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2">Concluído!</h3>
            <p className="mb-4">Parabéns! Você completou todo o processo. Agora pode visualizar os resultados, salvar a medição no prontuário ou gerar um relatório para impressão.</p>
            <div className="flex justify-end">
              <Button onClick={() => setShowTutorial(false)}>Finalizar tutorial</Button>
            </div>
          </div>
        );
        break;
      default:
        content = <div></div>;
    }
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div id="medicao-foto-container" className={`p-4 md:p-6 lg:p-8 space-y-6 bg-background text-foreground ${isFullScreen ? 'fixed inset-0 z-50 overflow-auto bg-background' : ''}`}>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">Medição Craniana por Foto (Semi-Automática)</CardTitle>
              <CardDescription>Paciente: {pacienteNome} - Faça o upload das imagens e marque os pontos anatômicos.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setShowTutorial(true)}><HelpCircle className="h-5 w-5" /></Button>
              <Button variant="outline" size="icon" onClick={() => setShowHelpModal(true)}><HelpCircle className="h-5 w-5" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <Tabs value={activeTabId} onValueChange={setActiveTabId} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4">
              {VIEW_TABS.map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  onClick={() => {
                    const img = uploadedImages.find(i => i.view === tab.id as UploadedImage["view"]);
                    setActiveImageId(img ? img.id : null);
                    setCurrentPointToMark(img ? null : (PONTOS_ANATOMICOS[tab.id as UploadedImage["view"]][0]?.id || null));
                  }}
                  className="relative"
                >
                  {tab.label}
                  {tab.isRequired && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {VIEW_TABS.map(tab => (
              <TabsContent key={tab.id} value={tab.id}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Upload da Vista: {tab.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-2 text-sm text-gray-500">
                          {tab.id === "superior" && "Foto de cima da cabeça, mostrando toda a calota craniana."}
                          {tab.id === "referencia" && "Foto com uma régua ou objeto de tamanho conhecido."}
                          {tab.id === "lateralDireita" && "Foto do perfil direito da cabeça."}
                          {tab.id === "lateralEsquerda" && "Foto do perfil esquerdo da cabeça."}
                          {tab.id === "frontal" && "Foto frontal da cabeça."}
                        </div>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e, tab.id as UploadedImage["view"])} 
                          className="mb-2"
                        />
                        {tab.isRequired && (
                          <p className="text-xs text-amber-600 mb-2">
                            {uploadedImages.find(img => img.view === tab.id) ? "" : "* Vista obrigatória"}
                          </p>
                        )}
                        {uploadedImages.find(img => img.view === tab.id) && 
                          <p className="text-sm text-green-600">
                            <CheckCircle className="inline h-4 w-4 mr-1"/> 
                            Imagem carregada.
                          </p>
                        }
                      </CardContent>
                    </Card>

                    {tab.id === "referencia" && uploadedImages.find(img => img.view === "referencia") && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Calibração</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Label htmlFor="rulerLength">Comprimento da Régua (mm)</Label>
                          <Input id="rulerLength" type="number" value={rulerLengthMm} onChange={(e) => setRulerLengthMm(e.target.value)} placeholder="Ex: 100 para 10cm" />
                          <Button 
                            onClick={() => handleCalibrate(uploadedImages.find(img => img.view === "referencia")!.id)} 
                            className="w-full"
                            disabled={
                              !uploadedImages.find(img => 
                                img.view === "referencia" && 
                                img.points.some(p => p.id === "ref1") &&
                                img.points.some(p => p.id === "ref2")
                              )
                            }
                          >
                            Calibrar Vista de Referência
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {activeImageState && activeImageState.view === tab.id && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Marcar Pontos Anatômicos</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-2">
                            Clique na imagem para marcar: 
                            <span className="font-semibold ml-1">
                              {PONTOS_ANATOMICOS[activeImageState.view].find(p => p.id === currentPointToMark)?.name || "Selecione um ponto"}
                            </span>
                          </p>
                          <Select 
                            value={currentPointToMark || ""} 
                            onValueChange={(value) => setCurrentPointToMark(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um ponto" />
                            </SelectTrigger>
                            <SelectContent>
                              {PONTOS_ANATOMICOS[activeImageState.view].map(p => (
                                <SelectItem 
                                  key={p.id} 
                                  value={p.id} 
                                  disabled={!!activeImageState.points.find(marked => marked.id === p.id)}
                                >
                                  {p.name} {activeImageState.points.find(marked => marked.id === p.id) ? "(Marcado)" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2" 
                            onClick={() => {
                              if(activeImageState && currentPointToMark) {
                                setUploadedImages(prev => prev.map(img => 
                                  img.id === activeImageState.id ? 
                                    {...img, points: img.points.filter(p => p.id !== currentPointToMark)} : 
                                    img
                                ));
                              }
                            }}
                            disabled={!currentPointToMark}
                          >
                            Limpar Ponto Atual
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="md:col-span-2 relative min-h-[300px] md:min-h-[500px] border rounded-md overflow-hidden bg-muted/40 flex items-center justify-center">
                    {activeImageState && activeImageState.view === tab.id && activeImageState.naturalWidth ? (
                      <div className="relative w-full h-full">
                        <img 
                          ref={el => imageRefs.current[activeImageState.id] = el} // This ref is mainly for initial load, drawing uses URL
                          src={activeImageState.url} 
                          alt={`Vista ${tab.id}`} 
                          onLoad={() => { 
                            if (!activeImageState.naturalWidth) { // Set natural dimensions if not already set
                                const currentImg = imageRefs.current[activeImageState.id];
                                if(currentImg) {
                                    setUploadedImages(prev => prev.map(img => img.id === activeImageState.id ? {...img, naturalWidth: currentImg.naturalWidth, naturalHeight: currentImg.naturalHeight } : img));
                                }
                            } else {
                                drawCanvas(activeImageState.id);
                            }
                          }}
                          className="absolute top-0 left-0 opacity-0 pointer-events-none w-0 h-0" // Hidden, used for dimensions only on initial load
                        />
                        <canvas
                          ref={el => canvasRefs.current[activeImageState.id] = el}
                          onClick={(e) => handleCanvasClick(e, activeImageState.id)}
                          className="cursor-crosshair object-contain w-full h-full"
                        />
                        <div className="absolute top-2 right-2 flex flex-col space-y-1 p-1 bg-background/80 rounded-md backdrop-blur-sm">
                          <Button variant="outline" size="icon" onClick={() => setZoomLevel(z => Math.min(z + 0.2, 5))}><ZoomIn className="h-4 w-4"/></Button>
                          <Button variant="outline" size="icon" onClick={() => setZoomLevel(z => Math.max(z - 0.2, 0.2))}><ZoomOut className="h-4 w-4"/></Button>
                          <Button variant="outline" size="icon" onClick={toggleFullScreen}>{isFullScreen ? <Minimize className="h-4 w-4"/> : <Maximize className="h-4 w-4"/>}</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        <Image className="mx-auto h-24 w-24 opacity-50 mb-2" />
                        <p>Nenhuma imagem carregada para esta vista.</p>
                        <p className="text-xs">Faça o upload no painel à esquerda.</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <Card>
              <CardHeader><CardTitle>Calcular Medidas</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Certifique-se de que todas as imagens necessárias foram carregadas, os pontos marcados corretamente e a vista de referência calibrada.</p>
                <div className="space-y-4">
                  <Button 
                    onClick={calculateMeasurements} 
                    className="w-full" 
                    disabled={isLoading || !allRequiredViewsUploaded() || !allRequiredPointsMarked() || !isCalibrated()}
                  >
                    {isLoading ? "Calculando..." : "Calcular Índices CR e CVAI"}
                  </Button>
                  
                  {measurementResults && (
                    <Button
                      onClick={() => setShowSaveConfirmDialog(true)}
                      className="w-full"
                      variant="outline"
                    >
                      <Save className="mr-2 h-4 w-4"/> Salvar no Prontuário
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {measurementResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultados da Medição</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p><strong>Índice Craniano (CR):</strong> {measurementResults.cr !== null ? `${measurementResults.cr}%` : "N/A"}</p>
                    {measurementResults.cr && measurementResults.cranialStatus && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        measurementResults.cranialStatus.severityLevel === "normal" ? "bg-green-100 text-green-800" :
                        measurementResults.cranialStatus.severityLevel === "leve" ? "bg-yellow-100 text-yellow-800" :
                        measurementResults.cranialStatus.severityLevel === "moderada" ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {measurementResults.cranialStatus.asymmetryType === "Normal" || 
                         measurementResults.cranialStatus.asymmetryType === "Plagiocefalia" ? 
                          "Normal" : measurementResults.cranialStatus.asymmetryType} 
                        {measurementResults.cranialStatus.asymmetryType !== "Normal" && 
                          ` (${measurementResults.cranialStatus.severityLevel === "normal" ? "leve" : measurementResults.cranialStatus.severityLevel})`
                        }
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p><strong>Índice de Assimetria (CVAI):</strong> {measurementResults.cvai !== null ? `${measurementResults.cvai}%` : "N/A"}</p>
                    {measurementResults.cvai !== null && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        measurementResults.cvai <= 3.5 ? "bg-green-100 text-green-800" :
                        measurementResults.cvai <= 6.25 ? "bg-yellow-100 text-yellow-800" :
                        measurementResults.cvai <= 8.75 ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {measurementResults.cvai <= 3.5 ? "Normal" : "Plagiocefalia"} 
                        {measurementResults.cvai > 3.5 && 
                          ` (${
                            measurementResults.cvai <= 6.25 ? "leve" :
                            measurementResults.cvai <= 8.75 ? "moderada" : "severa"
                          })`
                        }
                      </span>
                    )}
                  </div>
                  
                  <Separator className="my-2"/>
                  <p className="font-medium">Medidas (mm):</p>
                  {Object.entries(measurementResults.measurements).map(([key, value]) => (
                    <p key={key} className="text-sm">{key}: {value !== null ? value : "N/A"}</p>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={handleGenerateReport}>
                    <Printer className="mr-2 h-4 w-4"/> Gerar Relatório para Impressão
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Guia Rápido: Medição Craniana por Foto</DialogTitle>
            <DialogDescription>Siga estes passos para realizar as medições.</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none max-h-[60vh] overflow-y-auto pr-2">
            <h4>1. Preparação e Captura das Fotos:</h4>
            <ul>
              <li><strong>Iluminação:</strong> Use luz ambiente clara e difusa. Evite sombras fortes na cabeça do bebê.</li>
              <li><strong>Fundo:</strong> Utilize um fundo neutro e de cor sólida (ex: lençol branco ou verde claro).</li>
              <li><strong>Posicionamento do Bebê:</strong>
                <ul>
                  <li><strong>Vista Superior:</strong> Bebê deitado de costas, câmera diretamente acima da cabeça, alinhada com o nariz. Orelhas devem estar visíveis se possível.</li>
                  <li><strong>Vistas Laterais (Direita e Esquerda):</strong> Bebê deitado de lado (ou sentado, se estável), câmera ao nível da cabeça, perpendicular ao plano sagital. Mostrar todo o perfil.</li>
                  <li><strong>Vista Frontal:</strong> Bebê de frente para a câmera, cabeça reta.</li>
                </ul>
              </li>
              <li><strong>Objeto de Referência (Régua):</strong>
                <ul>
                  <li>Para a aba "Referência", tire uma foto APENAS de uma régua milimetrada (ou objeto de tamanho conhecido) sobre um fundo plano.</li>
                  <li>Anote o comprimento EXATO em milímetros da régua (ou da seção que será marcada).</li>
                  <li>Esta foto será usada para calibrar as medidas das outras fotos. NÃO inclua o bebê nesta foto.</li>
                </ul>
              </li>
              <li><strong>Qualidade:</strong> Fotos nítidas, sem borrões. A cabeça deve ocupar boa parte da imagem.</li>
            </ul>
            <h4>2. Upload e Calibração:</h4>
            <ul>
              <li>Use as abas para carregar cada vista da foto (Superior, Lateral Direita, etc.).</li>
              <li>Na aba "Referência", carregue a foto da sua régua. Marque os dois pontos que definem o comprimento conhecido e insira esse comprimento em mm. Clique em "Calibrar".</li>
            </ul>
            <h4>3. Marcação dos Pontos Anatômicos:</h4>
            <ul>
              <li>Selecione a aba da vista desejada (ex: Superior).</li>
              <li>No painel "Marcar Pontos Anatômicos", selecione o ponto que deseja marcar na lista.</li>
              <li>Clique na imagem no local correspondente ao ponto anatômico.</li>
              <li>Repita para todos os pontos necessários em cada vista. Os pontos já marcados ficam verdes.</li>
              <li><strong>Dica:</strong> Use os botões de Zoom (+/-) para maior precisão.</li>
            </ul>
            <h4>4. Cálculo dos Índices:</h4>
            <ul>
              <li>Após marcar todos os pontos em todas as vistas necessárias e calibrar a referência, clique em "Calcular Índices CR e CVAI".</li>
              <li>Os resultados serão exibidos.</li>
            </ul>
            <h4>Pontos Anatômicos Chave (Exemplos):</h4>
            <ul>
              <li><strong>Glabela (G):</strong> Ponto mais proeminente da testa, entre as sobrancelhas.</li>
              <li><strong>Opistocrânio (Op):</strong> Ponto mais posterior do crânio no plano sagital mediano.</li>
              <li><strong>Eurion (Eu):</strong> Pontos mais laterais do crânio (um de cada lado).</li>
              <li>Para CVAI, são usados pontos diagonais específicos (ex: a 30° da linha G-Op). Siga as instruções do sistema para esses pontos.</li>
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHelpModal(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaveConfirmDialog} onOpenChange={setShowSaveConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar medição no prontuário</DialogTitle>
            <DialogDescription>
              Deseja salvar esta medição no prontuário do paciente? Os resultados serão armazenados e estarão disponíveis para consulta futura.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveConfirmDialog(false)} disabled={isLoading}>Cancelar</Button>
            <Button onClick={saveMeasurementToDatabase} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Tutorial passo a passo */}
      <TutorialOverlay />
    </div>
  );
};

export default MedicaoPorFotoPage;
