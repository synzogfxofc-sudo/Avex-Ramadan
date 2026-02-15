import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowRight, X, Check, ChevronLeft } from 'lucide-react';

export interface TutorialStep {
  targetId: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps, isActive, onComplete, onSkip }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const currentStep = steps[currentStepIndex];

  const updatePosition = useCallback(() => {
    const element = document.getElementById(currentStep.targetId);
    if (element) {
        const newRect = element.getBoundingClientRect();
        setRect(newRect);
    }
  }, [currentStep.targetId]);

  useEffect(() => {
    if (!isActive) {
        setIsVisible(false);
        return;
    }

    const element = document.getElementById(currentStep.targetId);
    if (element) {
        // Always scroll to the element to make it easy for the user
        // Use 'center' to maximize space for the tooltip above or below
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        
        // Update position frequently during the scroll
        updatePosition();
        
        const intervals = [100, 300, 500, 800];
        intervals.forEach(t => setTimeout(updatePosition, t));

        // Fade in after a short delay to allow scroll to settle slightly
        const fadeTimer = setTimeout(() => setIsVisible(true), 300);
        return () => clearTimeout(fadeTimer);
    }
  }, [currentStepIndex, isActive, updatePosition, currentStep.targetId]);

  // Track window resize and scroll to keep spotlight accurate
  useEffect(() => {
    if (isActive) {
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, { passive: true });
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }
  }, [isActive, updatePosition]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  if (!isActive || !rect) return null;

  // --- Smart Positioning Logic ---
  const isMobile = window.innerWidth < 640;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const padding = 20; // safe area from screen edges

  // Card Dimensions (Approximate max values or dynamic)
  const cardWidth = isMobile ? viewportWidth - (padding * 2) : 380;
  const cardHeightEstimate = 250; // Estimate for overlap calculations

  // Calculate available spaces
  const spaceAbove = rect.top;
  const spaceBelow = viewportHeight - rect.bottom;

  // Decide position: Default to Bottom, switch to Top if not enough space below AND enough space above
  let showAbove = false;
  if (spaceBelow < cardHeightEstimate && spaceAbove > cardHeightEstimate) {
      showAbove = true;
  }
  // Special case: If neither side has space (element takes up whole screen), position at bottom of screen
  // (Not implemented here, assuming elements are smaller than viewport)

  // Calculate Left Position (Horizontal Centering)
  let left = rect.left + rect.width / 2;
  
  // Clamp horizontal position to keep card on screen
  const halfCard = cardWidth / 2;
  if (left - halfCard < padding) {
      left = padding + halfCard;
  } else if (left + halfCard > viewportWidth - padding) {
      left = viewportWidth - padding - halfCard;
  }

  // Calculate Top Position
  let top: number;
  if (showAbove) {
      // Place above the element
      top = rect.top - 24; // 24px gap
      // If we are showing above, we align the BOTTOM of the card to 'top'
      // In CSS we will use 'bottom' property or calculate explicit top.
      // Let's use explicit pixels for 'top' to control it fully.
      // Note: We don't know exact card height yet, so using bottom: (viewportHeight - rect.top) + gap is safer in CSS.
  } else {
      // Place below the element
      top = rect.bottom + 24; 
  }

  const tooltipStyle: React.CSSProperties = {
      position: 'absolute',
      left: left,
      transform: 'translateX(-50%)',
      width: cardWidth,
      maxWidth: '400px',
      zIndex: 110,
  };

  if (showAbove) {
      tooltipStyle.bottom = (viewportHeight - rect.top) + 24;
      tooltipStyle.top = 'auto';
  } else {
      tooltipStyle.top = rect.bottom + 24;
      tooltipStyle.bottom = 'auto';
  }

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        
      {/* 1. The Spotlight / Dark Overlay */}
      {/* This div creates the 'hole' effect using a massive box-shadow */}
      <div 
        className="absolute transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: '1rem', 
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)' // The dark overlay
        }}
      >
          {/* Animated Brackets for Focus Effect */}
          <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-lime-500 rounded-tl-xl animate-pulse" />
          <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-lime-500 rounded-tr-xl animate-pulse" />
          <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-lime-500 rounded-bl-xl animate-pulse" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-lime-500 rounded-br-xl animate-pulse" />
      </div>

      {/* 2. The Tooltip Card */}
      <div 
        className="flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={tooltipStyle}
      >
        {/* Connector Arrow */}
        <div 
            className="absolute left-1/2 -translate-x-1/2 text-lime-500 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            style={{ 
                [showAbove ? 'bottom' : 'top']: -20,
                transform: `translateX(-50%) ${showAbove ? 'rotate(180deg)' : 'rotate(0deg)'}`
            }}
        >
             <svg width="32" height="16" viewBox="0 0 40 20" fill="currentColor">
                <path d="M20 0L40 20H0L20 0Z" />
             </svg>
        </div>

        {/* Card Body */}
        <div className="relative bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700 rounded-3xl shadow-2xl w-full overflow-hidden">
           
           {/* Progress Bar */}
           <div className="absolute top-0 left-0 h-1 bg-zinc-800 w-full">
              <div 
                className="h-full bg-lime-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(132,204,22,0.6)]"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
           </div>

           <div className="p-6">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                     <span className="flex items-center justify-center w-6 h-6 rounded-full bg-lime-500 text-black text-xs font-bold">
                        {currentStepIndex + 1}
                     </span>
                     <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        of {steps.length}
                     </span>
                  </div>
                  <button 
                    onClick={onSkip} 
                    className="p-1.5 -mr-2 rounded-full hover:bg-white/10 transition-colors text-zinc-500 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="mb-6">
                   <h3 className="text-xl font-bold text-white mb-2">{currentStep.title}</h3>
                   <p className="text-zinc-400 text-sm leading-relaxed">
                     {currentStep.description}
                   </p>
               </div>

               <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    className={`
                        p-3 rounded-full border border-zinc-700 transition-all
                        ${currentStepIndex === 0 
                            ? 'opacity-20 cursor-not-allowed' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600'
                        }
                    `}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-black font-bold rounded-full transition-all hover:bg-lime-400 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>{currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}</span>
                    {currentStepIndex === steps.length - 1 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;