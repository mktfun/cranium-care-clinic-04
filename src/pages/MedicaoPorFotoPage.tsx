import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Image, AlertCircle, CheckCircle, HelpCircle, X, ZoomIn, ZoomOut, RotateCcw, Save, Download, Maximize, Minimize, Printer } from "lucide-react"; // Added Printer icon
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client"; // Replace import "@/lib/supabaseClient" with the correct import path
import { v4 as uuidv4 } from "uuid"; // Add uuid import 
import { useParams } from 'react-router-dom'; // To get patient ID from URL

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

const MedicaoPorFotoPage: React.FC = () => {
  const { id: pacienteIdParam } = useParams<{ id: string }>(); // Get patient ID from URL
  const [pacienteNome, setPacienteNome] = useState<string>("Carregando...");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [currentPointToMark, setCurrentPointToMark] = useState<string | null>(null);
  const [rulerLengthMm, setRulerLengthMm] = useState<string>("100");
  const [measurementResults, setMeasurementResults] = useState<MeasurementResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const imageRefs = useRef<Record<string, HTMLImageElement | null>>({});

  useEffect(() => {
    const fetchPacienteNome = async () => {
      if (pacienteIdParam) {
        const { data, error } = await supabase
          .from("pacientes")
          .select("nome_completo")
          .eq("id", pacienteIdParam)
          .single();
        if (error) {
          console.error("Erro ao buscar nome do paciente:", error);
          setPacienteNome("Paciente não encontrado");
        } else if (data) {
          setPacienteNome(data.nome_completo);
        }
      }
    };
    fetchPacienteNome();
  }, [pacienteIdParam]);

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
      };
      img.src = imageUrl;
      setActiveImageId(imageId);
      setCurrentPointToMark(PONTOS_ANATOMICOS[view][0]?.id || null);
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
      };
      tempImg.src = imageState.url; // Always use the URL for drawing

    }
  }, [uploadedImages, currentPointToMark, zoomLevel]);

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
    const currentIndex = PONTOS_ANATOMICOS[imageState.view].findIndex(p => p.id === currentPointToMark);
    if (currentIndex + 1 < PONTOS_ANATOMICOS[imageState.view].length) {
      setCurrentPointToMark(PONTOS_ANATOMICOS[imageState.view][currentIndex + 1].id);
    } else {
      setCurrentPointToMark(null);
    }
  };

  const handleCalibrate = (imageId: string) => {
    const imageState = uploadedImages.find(img => img.id === imageId);
    if (!imageState || imageState.view !== "referencia" || imageState.points.length < 2) {
      setError("Marque os dois pontos na régua de referência primeiro.");
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
      alert(`Calibração concluída: ${ratio.toFixed(2)} pixels/mm`);
    } else {
      setError("Erro na calibração. Verifique os pontos e o comprimento da régua.");
    }
  };

  const calculateMeasurements = () => {
    const superiorImg = uploadedImages.find(img => img.view === "superior");
    const refImg = uploadedImages.find(img => img.view === "referencia" && img.calibrationRatio);

    if (!superiorImg || !refImg || !refImg.calibrationRatio) {
      setError("Imagens da vista superior e de referência (calibrada) são necessárias.");
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
    const Diag1 = getDist("fp1", "pp2", superiorImg);
    const Diag2 = getDist("fp2", "pp1", superiorImg);

    let cr = null;
    if (EuR_EuL && G_Op && G_Op > 0) {
      cr = (EuR_EuL / G_Op) * 100;
    }

    let cvai = null;
    if (Diag1 && Diag2 && Diag1 > 0 && Diag2 > 0) {
      cvai = (Math.abs(Diag1 - Diag2) / Math.max(Diag1, Diag2)) * 100;
    }
    
    setMeasurementResults({
      cr: cr ? parseFloat(cr.toFixed(2)) : null,
      cvai: cvai ? parseFloat(cvai.toFixed(2)) : null,
      measurements: {
        "Comprimento (G-Op)": G_Op ? parseFloat(G_Op.toFixed(2)) : null,
        "Largura (EuR-EuL)": EuR_EuL ? parseFloat(EuR_EuL.toFixed(2)) : null,
        "Diagonal 1 (Fp1-Pp2)": Diag1 ? parseFloat(Diag1.toFixed(2)) : null,
        "Diagonal 2 (Fp2-Pp1)": Diag2 ? parseFloat(Diag2.toFixed(2)) : null,
      }
    });
    setError(null);
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
            </div>
            
            <div class="section">
              <h2>Resultados dos Índices</h2>
              <table class="results-table">
                <tr><th>Índice</th><th>Valor</th></tr>
                <tr><td>Índice Craniano (CR)</td><td>${measurementResults.cr !== null ? measurementResults.cr.toFixed(2) + "%" : "N/A"}</td></tr>
                <tr><td>Índice de Assimetria (CVAI)</td><td>${measurementResults.cvai !== null ? measurementResults.cvai.toFixed(2) + "%" : "N/A"}</td></tr>
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

  return (
    <div id="medicao-foto-container" className={`p-4 md:p-6 lg:p-8 space-y-6 bg-background text-foreground ${isFullScreen ? 'fixed inset-0 z-50 overflow-auto bg-background' : ''}`}>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">Medição Craniana por Foto (Semi-Automática)</CardTitle>
              <CardDescription>Paciente: {pacienteNome} - Faça o upload das imagens e marque os pontos anatômicos.</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowHelpModal(true)}><HelpCircle className="h-5 w-5" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <Tabs defaultValue="superior" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4">
              {(["superior", "lateralDireita", "lateralEsquerda", "frontal", "referencia"] as UploadedImage["view"][]).map(view => (
                <TabsTrigger key={view} value={view} onClick={() => {
                  const img = uploadedImages.find(i => i.view === view);
                  setActiveImageId(img ? img.id : null);
                  setCurrentPointToMark(img ? (PONTOS_ANATOMICOS[view][0]?.id || null) : (PONTOS_ANATOMICOS[view][0]?.id || null) );
                }}>
                  {view === "superior" && "Superior"}
                  {view === "lateralDireita" && "Lat. Direita"}
                  {view === "lateralEsquerda" && "Lat. Esquerda"}
                  {view === "frontal" && "Frontal"}
                  {view === "referencia" && "Referência"}
                </TabsTrigger>
              ))}
            </TabsList>

            {(["superior", "lateralDireita", "lateralEsquerda", "frontal", "referencia"] as UploadedImage["view"][]).map(viewType => (
              <TabsContent key={viewType} value={viewType}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Upload da Vista: {
                          viewType === "superior" ? "Superior" :
                          viewType === "lateralDireita" ? "Lateral Direita" :
                          viewType === "lateralEsquerda" ? "Lateral Esquerda" :
                          viewType === "frontal" ? "Frontal" :
                          "Objeto de Referência"
                        }</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, viewType)} className="mb-2" />
                        {uploadedImages.find(img => img.view === viewType) && <p className="text-sm text-green-600"><CheckCircle className="inline h-4 w-4 mr-1"/> Imagem carregada.</p>}
                      </CardContent>
                    </Card>

                    {viewType === "referencia" && uploadedImages.find(img => img.view === "referencia") && (
                      <Card>
                        <CardHeader><CardTitle className="text-lg">Calibração</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          <Label htmlFor="rulerLength">Comprimento da Régua (mm)</Label>
                          <Input id="rulerLength" type="number" value={rulerLengthMm} onChange={(e) => setRulerLengthMm(e.target.value)} placeholder="Ex: 100 para 10cm" />
                          <Button onClick={() => handleCalibrate(uploadedImages.find(img => img.view === "referencia")!.id)} className="w-full">
                            Calibrar Vista de Referência
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {activeImageState && activeImageState.view === viewType && (
                      <Card>
                        <CardHeader><CardTitle className="text-lg">Marcar Pontos Anatômicos</CardTitle></CardHeader>
                        <CardContent>
                          <p className="text-sm mb-2">Clique na imagem para marcar: <span className="font-semibold">{PONTOS_ANATOMICOS[viewType].find(p => p.id === currentPointToMark)?.name || "Nenhum selecionado"}</span></p>
                          <Select value={currentPointToMark || ""} onValueChange={(value) => setCurrentPointToMark(value)}>
                            <SelectTrigger><SelectValue placeholder="Selecione um ponto" /></SelectTrigger>
                            <SelectContent>
                              {PONTOS_ANATOMICOS[viewType].map(p => (
                                <SelectItem key={p.id} value={p.id} disabled={!!activeImageState.points.find(marked => marked.id === p.id)}>
                                  {p.name} {activeImageState.points.find(marked => marked.id === p.id) ? "(Marcado)" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => {
                            if(activeImageState && currentPointToMark) {
                                setUploadedImages(prev => prev.map(img => img.id === activeImageState.id ? {...img, points: img.points.filter(p => p.id !== currentPointToMark)} : img));
                            }
                          }}>Limpar Ponto Atual</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="md:col-span-2 relative min-h-[300px] md:min-h-[500px] border rounded-md overflow-hidden bg-muted/40 flex items-center justify-center">
                    {activeImageState && activeImageState.view === viewType && activeImageState.naturalWidth ? (
                      <div className="relative w-full h-full">
                        <img 
                          ref={el => imageRefs.current[activeImageState.id] = el} // This ref is mainly for initial load, drawing uses URL
                          src={activeImageState.url} 
                          alt={`Vista ${viewType}`} 
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
                <Button onClick={calculateMeasurements} className="w-full" disabled={isLoading || uploadedImages.length < 2 || !uploadedImages.find(img => img.view === 'referencia' && img.calibrationRatio)}>
                  {isLoading ? "Calculando..." : "Calcular Índices CR e CVAI"}
                </Button>
              </CardContent>
            </Card>

            {measurementResults && (
              <Card>
                <CardHeader><CardTitle>Resultados da Medição</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Índice Craniano (CR):</strong> {measurementResults.cr !== null ? `${measurementResults.cr}%` : "N/A"}</p>
                  <p><strong>Índice de Assimetria (CVAI):</strong> {measurementResults.cvai !== null ? `${measurementResults.cvai}%` : "N/A"}</p>
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

    </div>
  );
};

export default MedicaoPorFotoPage;
