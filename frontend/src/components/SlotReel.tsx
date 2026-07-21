import React from 'react';

interface SlotReelProps {
  isSpinning: boolean;
  value: string;
  spinSpeed: number;
}

export default function SlotReel({ isSpinning, value, spinSpeed }: SlotReelProps) {
  return (
    <div className="relative w-12 h-20 md:w-16 md:h-24 bg-black/60 border border-white/20 rounded-xl md:rounded-2xl overflow-hidden flex justify-center items-center shadow-inner">
      {isSpinning ? (
        <div 
          className="absolute flex flex-col items-center animate-slot-spin"
          style={{ animationDuration: `${spinSpeed}s` }}
        >
          {/* Strip of numbers repeated for infinite scroll */}
          {[0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9].map((n, i) => (
            <div key={i} className="h-20 md:h-24 flex items-center justify-center text-5xl md:text-6xl font-black text-gray-500 blur-[1px] md:blur-[2px]">
              {n}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-5xl md:text-6xl font-black neon-text-blue animate-bounce-short">
          {value}
        </div>
      )}
    </div>
  );
}
