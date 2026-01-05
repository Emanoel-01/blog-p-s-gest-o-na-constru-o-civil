import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageViewer({ images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  // Suporte para teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `imagem-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Botão Fechar */}
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0"
        size="icon"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Contador de imagens */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
          {currentIndex + 1} / {images.length}
        </div>
        )}

        {/* Controles de Zoom e Download */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full p-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          size="icon"
          className="bg-white/20 hover:bg-white/30 border-0 w-10 h-10 rounded-full"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </Button>
        <span className="text-white font-semibold px-3">{Math.round(zoom * 100)}%</span>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          size="icon"
          className="bg-white/20 hover:bg-white/30 border-0 w-10 h-10 rounded-full"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </Button>
        <div className="w-px h-8 bg-white/30 mx-2" />
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          size="icon"
          className="bg-white/20 hover:bg-white/30 border-0 w-10 h-10 rounded-full"
        >
          <Download className="w-5 h-5 text-white" />
        </Button>
        </div>

      {/* Seta Anterior */}
      {images.length > 1 && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 w-12 h-12 rounded-full"
          size="icon"
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
      )}

      {/* Imagem */}
      <div className="overflow-auto max-w-full max-h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex]}
          alt={`Imagem ${currentIndex + 1}`}
          className="object-contain transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Seta Próxima */}
      {images.length > 1 && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 w-12 h-12 rounded-full"
          size="icon"
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      )}
    </div>
  );
}