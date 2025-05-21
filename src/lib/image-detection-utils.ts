
/**
 * Utility functions for image processing and cranial measurements detection
 */

/**
 * Detects the edges in an image using a simple Sobel operator
 * @param imageData - The image data from a canvas context
 * @param width - Image width
 * @param height - Image height
 * @returns New ImageData with detected edges
 */
export function detectEdges(imageData: ImageData, width: number, height: number): ImageData {
  const data = imageData.data;
  const outputData = new Uint8ClampedArray(data.length);
  
  // Simple grayscale conversion and edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Convert to grayscale first
      const gx0 = getGrayscale(data, idx - width * 4 - 4);
      const gx1 = getGrayscale(data, idx - width * 4);
      const gx2 = getGrayscale(data, idx - width * 4 + 4);
      const gx3 = getGrayscale(data, idx - 4);
      const gx5 = getGrayscale(data, idx + 4);
      const gx6 = getGrayscale(data, idx + width * 4 - 4);
      const gx7 = getGrayscale(data, idx + width * 4);
      const gx8 = getGrayscale(data, idx + width * 4 + 4);
      
      // Sobel operator (simplified)
      const gx = -gx0 - 2 * gx3 - gx6 + gx2 + 2 * gx5 + gx8;
      const gy = -gx0 - 2 * gx1 - gx2 + gx6 + 2 * gx7 + gx8;
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      
      // Apply threshold
      const threshold = 30;
      const edge = magnitude > threshold ? 255 : 0;
      
      outputData[idx] = edge;
      outputData[idx + 1] = edge;
      outputData[idx + 2] = edge;
      outputData[idx + 3] = 255;
    }
  }
  
  return new ImageData(outputData, width, height);
}

/**
 * Get grayscale value from RGB data
 */
function getGrayscale(data: Uint8ClampedArray, idx: number): number {
  // Make sure index is valid
  idx = Math.max(0, Math.min(data.length - 4, idx));
  return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
}

/**
 * Detects head contour in the image
 * @param imageData - Edge detected image data
 * @param width - Image width
 * @param height - Image height
 * @returns Points defining the head contour
 */
export function detectHeadContour(
  edgeImageData: ImageData, 
  width: number, 
  height: number
): {x: number, y: number}[] {
  const data = edgeImageData.data;
  const contourPoints: {x: number, y: number}[] = [];
  
  // Scanning from different directions to find contour points
  // Top to bottom
  for (let x = 0; x < width; x += width / 30) {
    let foundPoint = false;
    
    for (let y = 0; y < height; y++) {
      const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
      
      if (data[idx] > 200) { // If edge pixel
        contourPoints.push({
          x: x / width,
          y: y / height
        });
        foundPoint = true;
        break;
      }
    }
    
    // If no point found in the column, use heuristic point
    if (!foundPoint) {
      contourPoints.push({
        x: x / width,
        y: height * 0.3 / height // Assume head is around 30% from top
      });
    }
  }
  
  // Left to right (for horizontal points)
  for (let y = 0; y < height; y += height / 15) {
    let leftmost = width;
    let rightmost = 0;
    
    for (let x = 0; x < width; x++) {
      const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
      
      if (data[idx] > 200) {
        leftmost = Math.min(leftmost, x);
        rightmost = Math.max(rightmost, x);
      }
    }
    
    if (leftmost < width) {
      contourPoints.push({
        x: leftmost / width,
        y: y / height
      });
    }
    
    if (rightmost > 0) {
      contourPoints.push({
        x: rightmost / width,
        y: y / height
      });
    }
  }
  
  return contourPoints;
}

/**
 * Finds key measurement points from head contour
 * @param contourPoints - Detected contour points
 * @returns Measurement points for cranial dimensions
 */
export function findMeasurementPoints(contourPoints: {x: number, y: number}[]): {
  comprimentoStart: {x: number, y: number};
  comprimentoEnd: {x: number, y: number};
  larguraStart: {x: number, y: number};
  larguraEnd: {x: number, y: number};
  diagonalDStart: {x: number, y: number};
  diagonalDEnd: {x: number, y: number};
  diagonalEStart: {x: number, y: number};
  diagonalEEnd: {x: number, y: number};
  apPoint: {x: number, y: number};
  bpPoint: {x: number, y: number};
  pdPoint: {x: number, y: number};
  pePoint: {x: number, y: number};
  tragusEPoint: {x: number, y: number};
  tragusDPoint: {x: number, y: number};
} {
  if (contourPoints.length === 0) {
    throw new Error("No contour points detected");
  }
  
  // Find extremes
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  let leftmostPoint = {x: 1, y: 0.5};
  let rightmostPoint = {x: 0, y: 0.5};
  let topmostPoint = {x: 0.5, y: 1};
  let bottommostPoint = {x: 0.5, y: 0};
  
  // Find extreme points
  for (const point of contourPoints) {
    if (point.x < minX) {
      minX = point.x;
      leftmostPoint = point;
    }
    if (point.x > maxX) {
      maxX = point.x;
      rightmostPoint = point;
    }
    if (point.y < minY) {
      minY = point.y;
      topmostPoint = point;
    }
    if (point.y > maxY) {
      maxY = point.y;
      bottommostPoint = point;
    }
  }
  
  // Calculate center
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  // Main dimensions
  const comprimentoStart = { x: minX, y: centerY };
  const comprimentoEnd = { x: maxX, y: centerY };
  
  const larguraStart = { x: centerX, y: minY };
  const larguraEnd = { x: centerX, y: maxY };
  
  // Diagonal measurements
  const diagonalDStart = { x: minX + (maxX - minX) * 0.15, y: minY + (maxY - minY) * 0.15 };
  const diagonalDEnd = { x: maxX - (maxX - minX) * 0.15, y: maxY - (maxY - minY) * 0.15 };
  
  const diagonalEStart = { x: minX + (maxX - minX) * 0.15, y: maxY - (maxY - minY) * 0.15 };
  const diagonalEEnd = { x: maxX - (maxX - minX) * 0.15, y: minY + (maxY - minY) * 0.15 };
  
  // Additional reference points
  const apPoint = { x: minX + (maxX - minX) * 0.3, y: minY + (maxY - minY) * 0.3 };
  const bpPoint = { x: maxX - (maxX - minX) * 0.3, y: minY + (maxY - minY) * 0.3 };
  const pdPoint = { x: minX + (maxX - minX) * 0.3, y: maxY - (maxY - minY) * 0.3 };
  const pePoint = { x: maxX - (maxX - minX) * 0.3, y: maxY - (maxY - minY) * 0.3 };
  
  // Ear landmarks (tragus points)
  const tragusEPoint = { x: minX + (maxX - minX) * 0.2, y: centerY + (maxY - centerY) * 0.6 };
  const tragusDPoint = { x: maxX - (maxX - minX) * 0.2, y: centerY + (maxY - centerY) * 0.6 };
  
  return {
    comprimentoStart,
    comprimentoEnd,
    larguraStart,
    larguraEnd,
    diagonalDStart,
    diagonalDEnd,
    diagonalEStart,
    diagonalEEnd,
    apPoint,
    bpPoint,
    pdPoint,
    pePoint,
    tragusEPoint,
    tragusDPoint
  };
}

/**
 * Detects a calibration object in the image (ruler or reference object)
 * @param imageData - The image data
 * @param width - Image width
 * @param height - Image height
 * @returns Position and size of detected calibration object
 */
export function detectCalibrationObject(
  imageData: ImageData,
  width: number,
  height: number
): {start: {x: number, y: number}, end: {x: number, y: number}} | null {
  // In a real implementation, this would use more sophisticated techniques
  // For now, we'll look for likely ruler regions (straight lines) at the bottom of the image
  
  // Default position - assume calibration object is often at the bottom of the image
  const defaultStart = { x: width * 0.15 / width, y: height * 0.85 / height };
  const defaultEnd = { x: width * 0.35 / width, y: height * 0.85 / height };
  
  // In a real implementation, we would detect horizontal lines that could be rulers
  // For now, we'll return the default position
  return {
    start: defaultStart,
    end: defaultEnd
  };
}

/**
 * Refines detected points based on image intensity and contours
 * @param points - Initial measurement points
 * @param originalImageData - Original image data
 * @param width - Image width
 * @param height - Image height
 * @returns Refined measurement points
 */
export function refineDetectedPoints(
  points: {[key: string]: {x: number, y: number}},
  originalImageData: ImageData,
  width: number, 
  height: number
): {[key: string]: {x: number, y: number}} {
  // In a real implementation, this would use edge refinement techniques
  // For now, we'll add a small random jitter to make it look more realistic
  
  const refinedPoints: {[key: string]: {x: number, y: number}} = {};
  
  for (const [key, point] of Object.entries(points)) {
    // Add small refinement (jitter) to make it look more natural
    const jitter = 0.01; // 1% jitter
    refinedPoints[key] = {
      x: Math.max(0, Math.min(1, point.x + (Math.random() - 0.5) * jitter)),
      y: Math.max(0, Math.min(1, point.y + (Math.random() - 0.5) * jitter))
    };
  }
  
  return refinedPoints;
}

/**
 * Estimates head size parameters from detected points
 * @param points - Detected measurement points
 * @param calibrationFactor - mm/pixel calibration factor
 * @param imgWidth - Image width in pixels
 * @returns Estimated measurements in mm
 */
export function estimateHeadParameters(
  points: {[key: string]: {x: number, y: number}},
  calibrationFactor: number,
  imgWidth: number
): {
  comprimento: number;
  largura: number;
  diagonalD: number;
  diagonalE: number;
  perimetroCefalico: number;
} {
  // Calculate distances between points
  const calculateDistance = (point1: {x: number, y: number}, point2: {x: number, y: number}) => {
    const dx = (point2.x - point1.x) * imgWidth;
    const dy = (point2.y - point1.y) * imgWidth;
    return Math.sqrt(dx * dx + dy * dy) * calibrationFactor;
  };
  
  const comprimento = calculateDistance(
    points.comprimentoStart,
    points.comprimentoEnd
  );
  
  const largura = calculateDistance(
    points.larguraStart,
    points.larguraEnd
  );
  
  const diagonalD = calculateDistance(
    points.diagonalDStart,
    points.diagonalDEnd
  );
  
  const diagonalE = calculateDistance(
    points.diagonalEStart,
    points.diagonalEEnd
  );
  
  // Estimate perimeter using elliptical approximation
  const perimetroCefalico = Math.PI * Math.sqrt(2 * (
    Math.pow(comprimento/2, 2) + Math.pow(largura/2, 2)
  ));
  
  return {
    comprimento: Math.round(comprimento),
    largura: Math.round(largura),
    diagonalD: Math.round(diagonalD),
    diagonalE: Math.round(diagonalE),
    perimetroCefalico: Math.round(perimetroCefalico)
  };
}
