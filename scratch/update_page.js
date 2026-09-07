const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/page.tsx', 'utf8');

// 1. Add state variables
content = content.replace(
  "const [betAmount, setBetAmount] = useState('');",
  "const [betAmount, setBetAmount] = useState('');\n  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);\n  const [selectedRound, setSelectedRound] = useState<number>(1);\n  const [betType, setBetType] = useState<string>('figure');\n  const [extraDigits, setExtraDigits] = useState('');"
);

// 2. Update handlePlaceBet
content = content.replace(
  "amount: Number(betAmount)",
  "amount: Number(betAmount),\n          round_selection: selectedRound,\n          bet_type: betType,\n          extra_digits: extraDigits"
);
content = content.replace(
  "setBetAmount('');",
  "setBetAmount('');\n      setIsBottomSheetOpen(false);"
);

// 3. Number Grid
const rightSidebarRegex = /<div className="glass-panel p-8 flex flex-col shadow-\[0_20px_50px_rgba\(0,0,0,0\.5\)\] border-t border-\[#00FF66\]\/20\">[\s\S]*?<\!-- TOP WINNERS \(Mini Leaderboard\) -->/;
const newGrid = `<div className="glass-panel p-6 lg:p-8 flex flex-col relative overflow-hidden border-t-2 border-t-[#FFD700] shadow-[0_30px_60px_rgba(0,0,0,0.6)] xl:sticky xl:top-24 z-20">
                <h3 className="text-2xl font-display font-black text-white text-center mb-8"><i className="fa-solid fa-gem text-[#FFD700] mr-2"></i> Select Number</h3>
                
                <div className="grid grid-cols-5 gap-3 sm:gap-4 relative z-10">
                  {[1,2,3,4,5,6,7,8,9,0].map(num => (
                    <button 
                      key={num}
                      onClick={() => { setBetNumber(num.toString()); setIsBottomSheetOpen(true); }}
                      className="aspect-square rounded-2xl bg-[#0D0D0D] border border-white/5 flex items-center justify-center font-mono text-3xl font-black text-white shadow-inner hover:border-[#FFD700] hover:text-[#FFD700] hover:shadow-[0_0_20px_rgba(255,212,0,0.6)] hover:scale-105 transition-all">
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOP WINNERS (Mini Leaderboard) */}`;
content = content.replace(rightSidebarRegex, newGrid);

// 4. Bottom Sheet Popup
const bottomSheet = `
      {/* BOTTOM SHEET (Bet Popup) */}
      <div className={\`fixed inset-0 z-[100] flex items-end justify-center \${isBottomSheetOpen ? '' : 'hidden'}\`}>
        <div className={\`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 \${isBottomSheetOpen ? 'opacity-100' : 'opacity-0'}\`} onClick={() => setIsBottomSheetOpen(false)}></div>
        
        <div className={\`relative w-full max-w-[600px] bg-[#121B2F] rounded-t-[32px] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] transition-transform duration-300 max-h-[90vh] overflow-y-auto flex flex-col \${isBottomSheetOpen ? 'translate-y-0' : 'translate-y-full'}\`}>
          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">Place Your Bet</h2>
              <button onClick={() => setIsBottomSheetOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"><i className="fa-solid fa-times"></i>X</button>
            </div>
            
            <div className="bg-[#0D0D0D] rounded-2xl p-4 flex items-center justify-between border border-white/5">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Selected Number</span>
              <span className="text-4xl font-mono font-black text-[#FFD700]">{betNumber}</span>
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Spin</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1,2,3,4].map(r => (
                  <button key={r} onClick={() => setSelectedRound(r)} className={\`p-3 rounded-xl border font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 \${selectedRound === r ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]' : 'border-white/10 bg-white/5 text-gray-300 hover:border-[#FFD700] hover:text-[#FFD700]'}\`}>
                    {r}{r===1?'st':r===2?'nd':r===3?'rd':'th'} Spin
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bet Amount</h3>
              <div className="flex flex-col gap-3">
                <input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="w-full bg-[#0D0D0D] text-white font-mono text-2xl p-4 text-center outline-none border border-white/10 focus:border-[#FFD700] rounded-2xl" placeholder="Custom Amount" />
                <div className="grid grid-cols-5 gap-2">
                   {['100', '500', '1000', '5000', 'MAX'].map(amt => (
                     <button key={amt} onClick={() => setBetAmount(amt === 'MAX' ? (user?.wallet || 0).toString() : amt)} className="py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 font-bold text-sm border border-white/10">
                       {amt}
                     </button>
                   ))}
                </div>
              </div>
            </div>
            
            <button onClick={handlePlaceBet} disabled={!betAmount || !betNumber} className="w-full bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-black py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-[0_10px_30px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
              Confirm Bet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
content = content.replace(/<\/div>\s*\n\s*<\/div>\s*\n\s*\);\s*\n}\s*$/, bottomSheet);

// 5. Replace colors
content = content.replace(/bg-\[#0B1220\]/g, 'bg-[#0D0D0D]');
content = content.replace(/bg-\[#131C2A\]/g, 'bg-[#121B2F]');
content = content.replace(/bg-\[#1A2536\]/g, 'bg-[#1E293B]');
content = content.replace(/text-\[#00FF66\]/g, 'text-[#FFD700]');
content = content.replace(/text-\[#00D9FF\]/g, 'text-[#FFD700]');
content = content.replace(/text-\[#FF4D6D\]/g, 'text-[#FFD700]');
content = content.replace(/bg-\[#00FF66\]/g, 'bg-[#FFD700]');
content = content.replace(/bg-\[#00D9FF\]/g, 'bg-[#FFD700]');
content = content.replace(/bg-\[#FF4D6D\]/g, 'bg-[#FFD700]');
content = content.replace(/border-\[#00FF66\]/g, 'border-[#FFD700]');
content = content.replace(/shadow-\[0_0_15px_rgba\(0,255,102,0\.2\)\]/g, 'shadow-[0_0_15px_rgba(255,215,0,0.2)]');
content = content.replace(/shadow-\[inset_0_0_20px_rgba\(0,255,102,0\.05\)\]/g, 'shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]');

fs.writeFileSync('frontend/src/app/page.tsx', content);
console.log('Done!');
