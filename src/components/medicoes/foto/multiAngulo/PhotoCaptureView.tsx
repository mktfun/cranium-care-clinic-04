
import React, { useRef, useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, Loader2, Image } from "lucide-react";
import { CaptureStep } from "@/pages/MultiAngleCapturaPage";

type PhotoCaptureViewProps = {
  currentStep: CaptureStep;
  previousPhoto: string | null;
  isCapturing: boolean;
  isProcessing: boolean;
  onCapturePhoto: () => void;
  onUploadPhoto: (event: React.ChangeEvent<HTMLInputElement>) => void;
  calibrationObject: {
    type: "ruler" | "coin" | "custom";
    size: number;
    position: { x: number; y: number } | null;
  };
  setCalibrationObject: React.Dispatch<React.SetStateAction<{
    type: "ruler" | "coin" | "custom";
    size: number;
    position: { x: number; y: number } | null;
  }>>;
};

export default function PhotoCaptureView({
  currentStep,
  previousPhoto,
  isCapturing,
  isProcessing,
  onCapturePhoto,
  onUploadPhoto,
  calibrationObject,
  setCalibrationObject
}: PhotoCaptureViewProps) {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Grid overlay for alignment
  const [showGrid, setShowGrid] = useState(true);
  
  useEffect(() => {
    // Check if camera is available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setHasCamera(true);
    } else {
      setHasCamera(false);
    }
    
    // Clean up camera stream when component unmounts
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);
  
  // Start camera when component mounts
  const startCamera = async () => {
    try {
      if (videoRef.current && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasCamera(false);
    }
  };

  // Handle calibration object type change
  const handleCalibrationTypeChange = (value: "ruler" | "coin" | "custom") => {
    setCalibrationObject(prev => ({
      ...prev,
      type: value,
      size: value === "ruler" ? 100 : value === "coin" ? 23 : prev.size // Default sizes: ruler=100mm, coin=23mm (R$1)
    }));
  };

  // Handle calibration object size change
  const handleCalibrationSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    if (!isNaN(size) && size > 0) {
      setCalibrationObject(prev => ({
        ...prev,
        size
      }));
    }
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="bg-card/50">
        <CardTitle className="text-card-foreground">Captura de Imagem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {hasCamera === null ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : hasCamera ? (
          <div className="space-y-4">
            {/* Camera View */}
            <div className="relative border rounded-lg overflow-hidden">
              <AspectRatio ratio={4/3}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover bg-black"
                  onClick={startCamera}
                />
                
                {/* Previous photo overlay */}
                {previousPhoto && (
                  <div className="absolute inset-0 pointer-events-none">
                    <img 
                      src={previousPhoto}
                      alt="Previous view"
                      className="w-full h-full object-cover opacity-30"
                    />
                  </div>
                )}
                
                {/* Grid overlay for alignment */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Horizontal lines */}
                    <div className="absolute left-0 top-1/3 right-0 h-px bg-primary/30" />
                    <div className="absolute left-0 top-2/3 right-0 h-px bg-primary/30" />
                    
                    {/* Vertical lines */}
                    <div className="absolute top-0 left-1/3 bottom-0 w-px bg-primary/30" />
                    <div className="absolute top-0 left-2/3 bottom-0 w-px bg-primary/30" />
                    
                    {/* Center indicator */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-dashed border-primary/50" />
                  </div>
                )}
              </AspectRatio>
              
              {/* Camera start overlay if not started */}
              {!cameraStream && hasCamera && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/70 cursor-pointer"
                  onClick={startCamera}
                >
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-white mx-auto mb-2" />
                    <p className="text-white">Clique para iniciar a câmera</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Calibration Object Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calibration-type">Objeto de referência</Label>
                <Select 
                  value={calibrationObject.type} 
                  onValueChange={(value: any) => handleCalibrationTypeChange(value)}
                >
                  <SelectTrigger id="calibration-type">
                    <SelectValue placeholder="Selecione um objeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ruler">Régua</SelectItem>
                    <SelectItem value="coin">Moeda (R$1)</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="calibration-size">Tamanho (mm)</Label>
                <Input
                  id="calibration-size"
                  type="number"
                  value={calibrationObject.size}
                  onChange={handleCalibrationSizeChange}
                  min={1}
                  step={1}
                />
              </div>
            </div>
            
            {/* Toggle Grid Button */}
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className="text-xs"
              >
                {showGrid ? "Ocultar Guias" : "Mostrar Guias"}
              </Button>
            </div>
            
            {/* Camera Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
              <Button 
                onClick={onCapturePhoto}
                variant="default"
                disabled={isCapturing || isProcessing || !cameraStream}
                className="shadow-md transition-all hover:shadow-lg"
              >
                {isCapturing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                Capturar Foto
              </Button>
              
              <div className="relative">
                <Button 
                  variant="outline"
                  disabled={isCapturing || isProcessing}
                  className="relative shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isProcessing ? "Processando..." : "Fazer Upload"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onUploadPhoto}
                  className="hidden"
                  disabled={isCapturing || isProcessing}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/30">
            <Image className="h-16 w-16 text-primary mb-4" />
            <p className="text-xl font-medium mb-2">Câmera não disponível</p>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Não foi possível acessar a câmera do dispositivo. Você pode fazer upload de uma foto.
            </p>
            
            <div className="relative">
              <Button 
                variant="default"
                disabled={isCapturing || isProcessing}
                className="relative shadow-md hover:shadow-lg transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isProcessing ? "Processando..." : "Fazer Upload"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onUploadPhoto}
                className="hidden"
                disabled={isCapturing || isProcessing}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
