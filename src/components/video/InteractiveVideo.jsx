import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Building2, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  MessageSquare,
  Info
} from 'lucide-react';

const iconMap = {
  Building2,
  TrendingUp,
  Users,
  Lightbulb,
  MessageSquare,
  Info
};

export default function InteractiveVideo({ videoSrc, posterSrc, hotspots, additionalContent }) {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const handleHotspotClick = (contentId) => {
    const video = videoRef.current;
    video.pause();
    setDialogContent(additionalContent[contentId]);
    setOpenDialog(true);
  };

  const handleDialogClose = (open) => {
    setOpenDialog(open);
    if (!open) {
      const video = videoRef.current;
      video.play();
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="relative bg-black rounded-xl shadow-2xl overflow-hidden border-4 border-green-600">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          className="w-full h-auto cursor-pointer"
          onClick={handlePlayPause}
          playsInline
        />

        {/* Hotspots Interativos */}
        {hotspots.map((hotspot) => {
          const IconComponent = iconMap[hotspot.icon] || Info;
          const isVisible = 
            currentTime >= hotspot.startTime && 
            (!hotspot.endTime || currentTime <= hotspot.endTime) &&
            playing;

          return (
            <Button
              key={hotspot.id}
              size="sm"
              style={{
                position: 'absolute',
                ...hotspot.position,
                transition: 'opacity 0.3s ease-in-out',
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? 'auto' : 'none',
              }}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg animate-pulse z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleHotspotClick(hotspot.contentId);
              }}
            >
              <IconComponent className="w-4 h-4 mr-1" />
              {hotspot.label}
            </Button>
          );
        })}

        {/* Controles do Vídeo */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={handlePlayPause}
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={handleMuteToggle}
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <div className="flex-1 text-white text-sm">
              {Math.floor(currentTime)}s / {Math.floor(videoRef.current?.duration || 0)}s
            </div>
          </div>
        </div>

        {/* Overlay Inicial */}
        {!playing && currentTime === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-full shadow-2xl"
              onClick={handlePlayPause}
            >
              <Play className="w-8 h-8 mr-2" />
              Assistir Apresentação
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Conteúdo Adicional */}
      <Dialog open={openDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {dialogContent?.icon && (() => {
                const IconComp = iconMap[dialogContent.icon];
                return IconComp ? <IconComp className="w-6 h-6 text-green-600" /> : null;
              })()}
              {dialogContent?.title}
            </DialogTitle>
            {dialogContent?.subtitle && (
              <DialogDescription className="text-gray-600">
                {dialogContent.subtitle}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {dialogContent?.description && (
              <p className="text-gray-700 leading-relaxed">{dialogContent.description}</p>
            )}
            {dialogContent?.items && dialogContent.items.length > 0 && (
              <ul className="space-y-2">
                {dialogContent.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {dialogContent?.image && (
              <img 
                src={dialogContent.image} 
                alt={dialogContent.title}
                className="w-full rounded-lg shadow-md"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}