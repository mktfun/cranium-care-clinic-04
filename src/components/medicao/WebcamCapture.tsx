
import React, { useRef } from 'react';
import Webcam from 'react-webcam';
import { Button } from "@/components/ui/button";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);

  const handleCapture = () => {
    if (webcamRef.current) {
      const imgSrc = webcamRef.current.getScreenshot();
      if (imgSrc) {
        onCapture(imgSrc);
      }
    }
  };

  return (
    <div className="relative">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="rounded-md w-full"
      />
      <Button 
        onClick={handleCapture} 
        className="absolute bottom-2 left-1/2 -translate-x-1/2"
      >
        Capturar Foto
      </Button>
    </div>
  );
};

export default WebcamCapture;
