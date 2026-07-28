import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../ui/Button';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedImageBase64: string) => void;
  onClose: () => void;
  aspect?: number;
}

export default function ImageCropperModal({
  imageSrc,
  onCropComplete,
  onClose,
  aspect = 1,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const handleCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return;
      }

      // Max size to prevent massive base64 strings
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;

      let targetWidth = croppedAreaPixels.width;
      let targetHeight = croppedAreaPixels.height;

      if (targetWidth > MAX_WIDTH || targetHeight > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / targetWidth, MAX_HEIGHT / targetHeight);
        targetWidth *= ratio;
        targetHeight *= ratio;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        targetWidth,
        targetHeight
      );

      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      onCropComplete(base64Image);
    } catch (e) {
      console.error(e);
      alert('Error cropping image');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <h2 className="text-lg font-bold font-outfit text-white">Crop Image</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative w-full h-[50vh] min-h-[300px] bg-black/50">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={handleCropComplete}
            onZoomChange={onZoomChange}
            classes={{
              containerClassName: 'w-full h-full',
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <ZoomOut className="w-5 h-5 text-slate-400" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(Number(e.target.value));
              }}
              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <ZoomIn className="w-5 h-5 text-slate-400" />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={createCroppedImage}>
              Crop & Confirm
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
