import React, { useState, useEffect, useCallback } from 'react';
import { Compass, X, Navigation, RotateCcw, AlertCircle, Smartphone } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface QiblaFinderProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const KAABA_LAT = 21.422487;
const KAABA_LONG = 39.826206;

const QiblaFinder: React.FC<QiblaFinderProps> = ({ isOpen, onClose, language }) => {
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const t = TRANSLATIONS[language];

  // Detect iOS for permission handling
  useEffect(() => {
    setIsIOS(
      typeof window !== 'undefined' && 
      (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad'))
    );
  }, []);

  const calculateQibla = (latitude: number, longitude: number) => {
    const phiK = KAABA_LAT * Math.PI / 180.0;
    const lambdaK = KAABA_LONG * Math.PI / 180.0;
    const phi = latitude * Math.PI / 180.0;
    const lambda = longitude * Math.PI / 180.0;

    const y = Math.sin(lambdaK - lambda);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
    let result = Math.atan2(y, x) * 180.0 / Math.PI;
    
    return (result + 360) % 360;
  };

  const startCompass = useCallback(() => {
    if (!isOpen) return;

    // 1. Get Location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const bearing = calculateQibla(latitude, longitude);
          setQiblaBearing(bearing);
          setError(null);
        },
        (err) => {
          setError(t.qibla_error_loc);
          console.error(err);
        }
      );
    } else {
      setError(t.qibla_error_support);
    }

    // 2. Get Orientation
    const handleOrientation = (e: DeviceOrientationEvent) => {
       let compass: number | null = null;
       
       // iOS
       if ((e as any).webkitCompassHeading) {
          compass = (e as any).webkitCompassHeading;
       } 
       // Non-iOS standard (fallback)
       else if (e.alpha !== null) {
          compass = 360 - e.alpha;
       }

       if (compass !== null) {
          setHeading(compass);
       }
    };

    // Android Chrome specific absolute orientation
    const handleAbsoluteOrientation = (e: DeviceOrientationEvent) => {
         if (e.alpha !== null) {
             setHeading(360 - e.alpha);
         }
    };

    // Try to add listeners
    if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleAbsoluteOrientation as any, true);
    }
    
    // Always add standard listener as fallback or for iOS
    window.addEventListener('deviceorientation', handleOrientation, true);
    
    return () => {
      if ('ondeviceorientationabsolute' in window) {
         window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation as any, true);
      }
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [isOpen, t]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (isOpen && permissionGranted) {
      cleanup = startCompass();
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [isOpen, permissionGranted, startCompass]);

  // Request Permission for iOS 13+
  const requestAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        } else {
          setError("Compass permission denied.");
        }
      } catch (e) {
        setError("Error requesting compass permission.");
      }
    } else {
      // Non-iOS or older devices usually don't need explicit permission prompt
      setPermissionGranted(true);
    }
  };

  // Check if we already have access (non-iOS)
  useEffect(() => {
    if (isOpen && !isIOS) {
        setPermissionGranted(true);
    }
  }, [isOpen, isIOS]);

  if (!isOpen) return null;

  const rotation = heading !== null ? -heading : 0;
  const qiblaRotation = qiblaBearing !== null ? qiblaBearing : 0;
  
  // If we have bearing but no heading (Desktop), show simpler UI
  const isDesktopMode = qiblaBearing !== null && (heading === null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-lime-500/10 rounded-xl">
                <Compass className="w-6 h-6 text-lime-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{t.qibla}</h2>
        </div>

        {error ? (
          <div className="flex flex-col items-center text-center gap-4 py-8">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-zinc-400 text-sm">{error}</p>
            <button 
                onClick={startCompass}
                className="px-6 py-2 bg-zinc-800 rounded-full text-white text-sm font-medium hover:bg-zinc-700"
            >
                {t.qibla_retry}
            </button>
          </div>
        ) : !permissionGranted && isIOS ? (
          <div className="flex flex-col items-center text-center gap-4 py-8">
            <Navigation className="w-12 h-12 text-lime-400" />
            <p className="text-zinc-400 text-sm">{t.qibla_allow}</p>
            <button 
              onClick={requestAccess}
              className="px-6 py-3 bg-lime-500 text-black font-bold rounded-full hover:bg-lime-400 transition-colors"
            >
              {t.qibla_enable}
            </button>
          </div>
        ) : (
          <>
             {/* Compass UI */}
             <div className="relative w-64 h-64 mb-8">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-zinc-800 bg-zinc-900/50 shadow-inner"></div>
                
                {/* Rotating Compass Dial */}
                <div 
                    className="absolute inset-2 transition-transform duration-300 ease-out will-change-transform"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {/* Ticks */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`absolute top-0 left-1/2 -translate-x-1/2 w-0.5 origin-bottom ${i % 3 === 0 ? 'h-4 bg-zinc-500' : 'h-2 bg-zinc-700'}`}
                            style={{ height: '50%', transform: `rotate(${i * 30}deg)` }} 
                        />
                    ))}

                    {/* North Marker */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white font-bold text-lg">N</div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-zinc-600 font-bold text-xs">S</div>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold text-xs">W</div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold text-xs">E</div>

                    {/* Qibla Marker (Attached to the dial) */}
                    {qiblaBearing !== null && (
                        <div 
                            className="absolute top-0 left-1/2 w-0.5 h-1/2 origin-bottom transition-all duration-700"
                            style={{ transform: `rotate(${qiblaRotation}deg)` }}
                        >
                             {/* The actual icon/marker at the end of the stick */}
                             <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <div className="w-8 h-8 bg-lime-500 text-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(132,204,22,0.5)] z-10 animate-bounce">
                                   <div className="w-2 h-2 bg-black rounded-sm transform rotate-45"></div>
                                </div>
                                <div className="h-8 w-0.5 bg-lime-500/50"></div>
                             </div>
                        </div>
                    )}
                </div>

                {/* Center Point */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="w-16 h-16 bg-zinc-800/80 backdrop-blur rounded-full border border-zinc-700 flex items-center justify-center z-20">
                         {isDesktopMode ? (
                             <div className="flex flex-col items-center">
                                <span className="text-lime-400 font-bold text-lg">{qiblaBearing?.toFixed(0)}°</span>
                                <span className="text-[10px] text-zinc-500">{t.bearing}</span>
                             </div>
                         ) : (
                             <Navigation className="w-6 h-6 text-zinc-400" />
                         )}
                     </div>
                </div>
             </div>

             <div className="text-center">
                {isDesktopMode ? (
                    <p className="text-zinc-400 text-sm">
                        Qibla is <span className="text-white font-bold">{qiblaBearing?.toFixed(1)}°</span> {t.from_north}.
                        <br/>
                        <span className="text-xs text-zinc-600 mt-2 block flex items-center justify-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          Compass not detected
                        </span>
                    </p>
                ) : (
                    <div>
                      <p className="text-zinc-400 text-sm">
                          {t.qibla_align}
                      </p>
                      {/* Calibration Hint */}
                      <p className="text-[10px] text-zinc-600 mt-2">
                        If incorrect, wave device in Figure 8.
                      </p>
                    </div>
                )}
             </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QiblaFinder;