
import React from 'react';
import WebcamCapture from './WebcamCapture';
import CapturedImage from './CapturedImage';

interface PhotoCaptureSectionProps {
  showWebcam: boolean;
  imageSrc: string | null;
  onCapture: (imageSrc: string) => void;
  onRetake: () => void;
}

const PhotoCaptureSection: React.FC<PhotoCaptureSectionProps> = ({
  showWebcam,
  imageSrc,
  onCapture,
  onRetake
}) => {
  if (showWebcam) {
    return <WebcamCapture onCapture={onCapture} />;
  }
  
  return imageSrc ? <CapturedImage imageSrc={imageSrc} onRetake={onRetake} /> : null;
};

export default PhotoCaptureSection;
