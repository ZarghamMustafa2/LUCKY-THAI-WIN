import React, { useEffect, useState } from 'react';

interface SpinWheelProps {
  isDrawing: boolean;
  winningNumber: string | null;
}

export default function SpinWheel({ isDrawing, winningNumber }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [lockedDigits, setLockedDigits] = useState<string[]>([]);
  
  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    
    if (isDrawing && winningNumber) {
      setLockedDigits([]);
      setRotation(0);
      
      const targetDigits = winningNumber.split('');
      let currentRotation = 0;
      
      const spinDigit = (index: number) => {
        if (index >= 4) return;
        
        const targetDigit = parseInt(targetDigits[index]);
        const currentAngle = currentRotation % 360;
        const targetAngle = 360 - (targetDigit * 36);
        
        let addedRotation = 1080 + (targetAngle - currentAngle);
        if (addedRotation < 1080) addedRotation += 360;
        
        currentRotation += addedRotation;
        setRotation(currentRotation);
        
        timeouts.push(setTimeout(() => {
          setLockedDigits(prev => {
            const next = [...prev];
            next[index] = targetDigit.toString();
            return next;
          });
          
          timeouts.push(setTimeout(() => {
            spinDigit(index + 1);
          }, 600));
        }, 4500));
      };
      
      timeouts.push(setTimeout(() => spinDigit(0), 100));
      
    } else if (!isDrawing) {
      setRotation(0);
      setLockedDigits([]);
    }
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isDrawing, winningNumber]);

  return (
    <div className="relative w-80 h-80 sm:w-[360px] sm:h-[360px] md:w-[520px] md:h-[520px] aspect-square flex-shrink-0 mx-auto mb-32 md:mb-40 flex justify-center items-center">
      {/* Glowing Backdrop */}
      <div className="absolute inset-0 bg-[#00FF66] opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Pointer at the top */}
      <div className="absolute top-[-15px] md:top-[-25px] left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]"></div>
      
      {/* The Wheel Frame */}
      <div className="w-full h-full rounded-full border-[12px] border-[#131C2A] shadow-[0_0_50px_rgba(0,255,102,0.1),inset_0_0_30px_rgba(0,0,0,0.8)] overflow-hidden relative" style={{ transform: 'translateZ(0)' }}>
        
        {/* The Spinning Content */}
        <div 
          className="w-full h-full relative rounded-full"
          style={{
            transition: isDrawing && rotation > 0 ? 'transform 4.5s cubic-bezier(0.1, 1, 0.1, 1)' : 'none',
            transform: `rotate(${rotation}deg)`,
            filter: isDrawing && rotation > 0 ? 'blur(1px)' : 'none'
          }}
        >
          {/* Background Slices (10 slices) */}
          <div 
            className="absolute -inset-4"
            style={{
              background: `conic-gradient(
                from -18deg,
                #1A2536 0deg 36deg,
                #131C2A 36deg 72deg,
                #1A2536 72deg 108deg,
                #131C2A 108deg 144deg,
                #1A2536 144deg 180deg,
                #131C2A 180deg 216deg,
                #1A2536 216deg 252deg,
                #131C2A 252deg 288deg,
                #1A2536 288deg 324deg,
                #131C2A 324deg 360deg
              )`
            }}
          ></div>

          {/* Text for each slice 0-9 */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const rotationAngle = num * 36;
            return (
              <div 
                key={num}
                className="absolute top-0 left-0 w-full h-full flex justify-center"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                <div className="pt-6 md:pt-10 text-4xl md:text-6xl font-black text-[#FFD700] drop-shadow-[0_4px_10px_rgba(0,0,0,1)]">
                  {num}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Inner Hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-28 md:h-28 bg-[#0B1220] rounded-full border-4 border-[#FFD700] z-10 shadow-[0_0_30px_rgba(0,0,0,1)] flex items-center justify-center">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-[#1A2536] to-[#131C2A] rounded-full shadow-inner"></div>
        </div>
      </div>

      {/* The 4 Digits Display Below the Wheel */}
      <div className="absolute -bottom-24 md:-bottom-36 flex gap-4 md:gap-6 justify-center w-full">
        {[0, 1, 2, 3].map(idx => (
          <div key={idx} className={`w-16 h-20 md:w-24 md:h-28 rounded-2xl border-2 flex items-center justify-center text-5xl md:text-6xl font-black transition-all duration-500 ${
            lockedDigits[idx] !== undefined 
              ? 'border-[#00FF66] bg-[#00FF66]/10 text-[#00FF66] shadow-[0_0_30px_rgba(0,255,102,0.3)] scale-110' 
              : 'border-[rgba(255,255,255,0.08)] bg-[#131C2A] text-gray-700 shadow-xl'
          }`}>
            {lockedDigits[idx] !== undefined ? lockedDigits[idx] : '?'}
          </div>
        ))}
      </div>
    </div>
  );
}
