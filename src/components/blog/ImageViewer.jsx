import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageViewer({ imageUrl, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white"
        size="icon"
      >
        <X className="w-6 h-6" />
      </Button>
      <img
        src={imageUrl}
        alt="Visualização ampliada"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}