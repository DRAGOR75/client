import React from 'react';
import { useProctoring } from '../hooks/useProctoring';
import { AlertTriangle, Video, VideoOff } from 'lucide-react';

export const ProctoringOverlay: React.FC = () => {
  const { videoRef, canvasRef, isModelLoaded, cameraError, warningMessage } = useProctoring();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3 pointer-events-none">
      {/* Warning Banner */}
      {warningMessage && (
        <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-pulse pointer-events-auto">
          <AlertTriangle size={24} />
          <div>
            <p className="font-bold text-sm uppercase tracking-wider">Proctoring Alert</p>
            <p className="text-sm font-medium">{warningMessage}</p>
          </div>
        </div>
      )}

      {/* Camera PIP */}
      <div className="relative w-48 h-36 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 pointer-events-auto group">
        {!isModelLoaded && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
            <span className="text-xs font-medium">Initializing AI...</span>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-4 text-center bg-gray-900/90 backdrop-blur-sm z-20">
            <VideoOff size={24} className="mb-2" />
            <span className="text-xs font-bold leading-tight">{cameraError}</span>
          </div>
        )}

        {/* Video element - mirrored for natural feel */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />

        {/* Canvas for landmarks overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none"
          width={320}
          height={240}
        />

        {/* Status Indicator overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-md">
          <div className={`w-2 h-2 rounded-full ${cameraError ? 'bg-red-500' : isModelLoaded ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            {cameraError ? 'Offline' : isModelLoaded ? 'Live' : 'Loading'}
          </span>
        </div>
      </div>
    </div>
  );
};
