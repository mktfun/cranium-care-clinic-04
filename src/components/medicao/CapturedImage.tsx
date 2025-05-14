
import React from 'react';
import { Button } from "@/components/ui/button";

interface CapturedImageProps {
  imageSrc: string;
  onRetake: () => void;
}

const CapturedImage: React.FC<CapturedImageProps> = ({ imageSrc, onRetake }) => {
  return (
    <div className="relative">
      <img src={imageSrc} alt="Captured" className="rounded-md w-full" />
      <Button 
        onClick={onRetake} 
        className="absolute bottom-2 left-1/2 -translate-x-1/2"
      >
        Retirar Foto
      </Button>
    </div>
  );
};

export default CapturedImage;
