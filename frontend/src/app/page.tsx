'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import AuthModal from '@/components/AuthModal';
import SpinWheel from '@/components/SpinWheel';
import Confetti from 'react-confetti';
import { 
  Menu, Search, Wallet, User, Bell, ChevronDown, MessageSquare, Headset, ShieldCheck, 
  Settings, TrendingUp, Trophy, Flame, PlayCircle, Star, Hash, Gamepad2, Gift, Dices, Clover
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('lottery');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [betNumber, setBetNumber] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [betType, setBetType] = useState<string>('figure');
  const [extraDigits, setExtraDigits] = useState('');
  
  // Existing state
  const [remainingMs, setRemainingMs] = useState(0);
  const [currentRoundId, setCurrentRoundId] = useState<number | null>(null);
  const [roundNumberStr, setRoundNumberStr] = useState<string>('WAITING...');
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [liveBets, setLiveBets] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [finalWinner, setFinalWinner] = useState<string | null>(null);
  const [pendingWinner, setPendingWinner] = useState<string | null>(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Dummy stats for the premium feel
  const [onlinePlayers, setOnlinePlayers] = useState(3204);
  const [totalWagered, setTotalWagered] = useState(45200000);
  const [jackpotPool, setJackpotPool] = useState(5100000);
  
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const newSocket = io(API_URL);
    setSocket(newSocket);

    fetch(`${API_URL}/api/rounds/current`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setCurrentRoundId(data.id);
          setRoundNumberStr(data.round_number);
        }
      }).catch(console.error);

    fetch(`${API_URL}/api/rounds/results`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentResults(data);
      }).catch(console.error);

    newSocket.on('tick', (data: any) => {
      setRemainingMs(data.remainingMs);
      if (data.roundId !== currentRoundId) {
        setCurrentRoundId(data.roundId);
      }
      
      // Randomly fluctuate fake stats for realism
      if(Math.random() > 0.7) setOnlinePlayers(prev => prev + Math.floor(Math.random() * 5) - 2);
      if(Math.random() > 0.5) setTotalWagered(prev => prev + Math.floor(Math.random() * 10000));
      if(Math.random() > 0.5) setJackpotPool(prev => prev + Math.floor(Math.random() * 5000));
    });

    newSocket.on('round_started', (data: any) => {
      setCurrentRoundId(data.id);
      setRoundNumberStr(data.round_number);
      setLiveBets([]); 
      setIsDrawing(false);
      setFinalWinner(null);
      setPendingWinner(null);
      if (token) fetchWallet(token);
    });

    newSocket.on('round_ended', (data: any) => {
      setIsDrawing(true);
      setFinalWinner(null);
      setPendingWinner(data.winningNumber);
      
      setTimeout(() => {
        setFinalWinner(data.winningNumber);
        setRecentResults(prev => [{ round_number: roundNumberStr, winning_number: data.winningNumber, id: data.roundId }, ...prev].slice(0, 20));
        if (token) fetchWallet(token);
      }, 22000);
      
      setRemainingMs(0);
    });

    newSocket.on('new_bet', (data: any) => {
      setLiveBets(prev => [data, ...prev].slice(0, 15));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentRoundId, roundNumberStr, token]);

  const fetchWallet = async (authToken: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/wallet`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.wallet !== undefined) {
        setUser((prev: any) => ({ ...prev, wallet: data.wallet }));
      }
    } catch (e) {
      console.error('Failed to fetch wallet');
    }
  };

  const handleLoginSuccess = (t: string, u: any) => {
    setToken(t);
    setUser(u);
  };

  const handlePlaceBet = async () => {
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!betNumber || !betAmount || !currentRoundId) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/bets/place`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          round_id: currentRoundId,
          bet_number: betNumber,
          amount: Number(betAmount),
          round_selection: selectedRound,
          bet_type: betType,
          extra_digits: extraDigits
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setBetNumber('');
      setBetAmount('');
      setIsBottomSheetOpen(false);
      fetchWallet(token);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const possiblePrize = betAmount && betNumber ? Number(betAmount) * (10 ** (betNumber.length - 1)) * 9 : 0;
  let winChance = 0;
  if (betNumber.length === 1) winChance = 10;
  if (betNumber.length === 2) winChance = 1;
  if (betNumber.length === 3) winChance = 0.1;
  if (betNumber.length === 4) winChance = 0.01;

  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');

  // New UI Components inline
  const StatCard = ({ title, value, icon }: any) => (
    <div className="bg-[#121B2F] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 flex items-center gap-4 hover:bg-[#1E293B] transition-colors shadow-lg">
      <div className="w-10 h-10 rounded-full bg-[#0D0D0D] flex items-center justify-center shadow-inner border border-[rgba(255,255,255,0.02)]">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{title}</span>
        <span className="text-white font-black text-lg">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0D0D0D] text-white overflow-hidden font-sans">
      
      {finalWinner && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={800} gravity={0.15} colors={['#00FF66', '#00D9FF', '#FFD700', '#FF4D6D', '#FFFFFF']} />
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={handleLoginSuccess} />

      {/* MOBILE OVERLAY */}
      <div className={`fixed inset-0 bg-black/60 z-30 transition-opacity xl:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      {/* LEFT SIDEBAR */}
      <aside className={`fixed xl:static inset-y-0 left-0 w-64 bg-[#121B2F] border-r border-[rgba(255,255,255,0.05)] flex flex-col flex-shrink-0 z-40 transition-transform duration-300 shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}`}>
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[rgba(255,255,255,0.05)]">
          <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.4)]">
            <span className="font-black text-xl text-[#0B1220]">T</span>
          </div>
          <h1 className="text-xl font-black tracking-widest uppercase">
            <span className="text-white">THAI</span><span className="text-[#FFD700]">NXT</span>
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1 custom-scrollbar">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-3">Casino</div>
          <button onClick={() => setActiveTab('lottery')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'lottery' ? 'bg-[#1E293B] text-white border-l-2 border-[#FFD700] shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]' : 'text-gray-400 hover:bg-[#1E293B] hover:text-white group hover:translate-x-1'}`}>
            <Hash className={`w-5 h-5 ${activeTab === 'lottery' ? 'text-[#FFD700]' : 'group-hover:text-[#FFD700] transition-colors'}`} /> Thai Lottery
          </button>
          <button onClick={() => setActiveTab('popular')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'popular' ? 'bg-[#1E293B] text-white border-l-2 border-[#FFD700] shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]' : 'text-gray-400 hover:bg-[#1E293B] hover:text-white group hover:translate-x-1'}`}>
            <Flame className={`w-5 h-5 ${activeTab === 'popular' ? 'text-[#FFD700]' : 'group-hover:text-[#FFD700] transition-colors'}`} /> Popular
          </button>
          <button onClick={() => setActiveTab('slots')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'slots' ? 'bg-[#1E293B] text-white border-l-2 border-[#FFD700] shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]' : 'text-gray-400 hover:bg-[#1E293B] hover:text-white group hover:translate-x-1'}`}>
            <Gamepad2 className={`w-5 h-5 ${activeTab === 'slots' ? 'text-[#FFD700]' : 'group-hover:text-[#FFD700] transition-colors'}`} /> Slots
          </button>
          <button onClick={() => setActiveTab('roulette')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'roulette' ? 'bg-[#1E293B] text-white border-l-2 border-[#FFD700] shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]' : 'text-gray-400 hover:bg-[#1E293B] hover:text-white group hover:translate-x-1'}`}>
            <PlayCircle className={`w-5 h-5 ${activeTab === 'roulette' ? 'text-[#FFD700]' : 'group-hover:text-[#FFD700] transition-colors'}`} /> Roulette
          </button>
          
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-6 mb-2 px-3">Rewards & Stats</div>
          <button onClick={() => setActiveTab('promotions')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'promotions' ? 'bg-[#1E293B] text-white border-l-2 border-[#FFD700] shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]' : 'text-gray-400 hover:bg-[#1E293B] hover:text-white group hover:translate-x-1'}`}>
            <Gift className={`w-5 h-5 ${activeTab === 'promotions' ? 'text-[#FFD700]' : 'group-hover:text-[#FFD700] transition-colors'}`} /> Promotions
          </button>
          <button onClick={() => setActiveTab('vip')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'vip' ? 'bg-[#1E293B] text-white border-l-2 border-[#FFD700] shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]' : 'text-gray-400 hover:bg-[#1E293B] hover:text-white group hover:translate-x-1'}`}>
            <Star className={`w-5 h-5 ${activeTab === 'vip' ? 'text-[#FFD700]' : 'group-hover:text-[#FFD700] transition-colors'}`} /> VIP Club
          </button>
          <button onClick={() => setActiveTab('leaderboard')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-[#1E293B] text-white border-l-2 border-[#FFD700] shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]' : 'text-gray-400 hover:bg-[#1E293B] hover:text-white group hover:translate-x-1'}`}>
            <Trophy className={`w-5 h-5 ${activeTab === 'leaderboard' ? 'text-[#FFD700]' : 'group-hover:text-[#FFD700] transition-colors'}`} /> Leaderboard
          </button>
        </div>
        
        <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[#0D0D0D]/50">
          <button className="flex items-center justify-center gap-2 w-full py-3 bg-[#1E293B] hover:bg-[rgba(0,255,102,0.1)] hover:text-[#FFD700] text-gray-400 rounded-xl font-bold transition-all border border-[rgba(255,255,255,0.02)]">
            <Headset className="w-4 h-4" /> Live Support
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-[#0D0D0D]/90 backdrop-blur-lg border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-4 lg:px-8 z-20 flex-shrink-0 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="xl:hidden text-gray-400 hover:text-white"><Menu /></button>
            <div className="xl:hidden flex items-center gap-2">
              <span className="text-[#FFD700] font-black text-xl">THAINXT</span>
            </div>
            
            <div className="hidden lg:flex items-center bg-[#121B2F] rounded-full px-4 py-2.5 border border-[rgba(255,255,255,0.05)] focus-within:border-[#FFD700] transition-colors w-[300px]">
              <Search className="w-4 h-4 text-gray-500 mr-3" />
              <input type="text" placeholder="Search games, slots..." className="bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-600 w-full font-bold" />
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-6">
            {user ? (
              <>
                <div className="flex items-center bg-[#121B2F] rounded-xl border border-[rgba(255,255,255,0.05)] shadow-inner overflow-hidden">
                  <div className="px-5 py-2.5 flex items-center gap-2 border-r border-[rgba(255,255,255,0.05)] bg-[#0D0D0D]/50">
                    <span className="text-[#FFD700] font-black text-sm md:text-base tracking-widest">฿ {user.wallet?.toLocaleString()}</span>
                  </div>
                  <button className="bg-[#FFD700] hover:bg-[#00b8e6] text-[#0B1220] font-black px-5 py-2.5 text-sm uppercase tracking-widest transition-colors flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> <span className="hidden md:inline">Deposit</span>
                  </button>
                </div>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-[#121B2F] p-1.5 pr-4 rounded-full transition-colors border border-transparent hover:border-[rgba(255,255,255,0.05)]">
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#FF4D6D] to-[#b026ff] rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setIsAuthModalOpen(true)} className="text-white hover:text-[#FFD700] font-bold text-sm px-4 py-2 transition-colors uppercase tracking-widest">Sign In</button>
                <button onClick={() => setIsAuthModalOpen(true)} className="bg-[#FFD700] hover:bg-[#00e65c] text-[#0B1220] px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)]">Register</button>
              </div>
            )}
          </div>
        </header>

        {/* SCROLLABLE MAIN AREA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-28 lg:p-8 lg:pb-8 relative bg-gradient-to-b from-[#0B1220] to-[#05080F]">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#FFD700] opacity-[0.02] rounded-full blur-[150px] pointer-events-none"></div>
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#FFD700] opacity-[0.02] rounded-full blur-[150px] pointer-events-none"></div>

          <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
            {activeTab === 'lottery' ? (
              <>
            {/* CENTER STAGE (Left 8 cols on desktop) */}
            <div className="xl:col-span-8 flex flex-col gap-8">
              
              {/* Premium Live Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
                <StatCard title="Players Online" value={onlinePlayers.toLocaleString()} icon={<User className="w-4 h-4 text-[#FFD700]"/>} />
                <StatCard title="Total Wagered" value={`฿ ${(totalWagered / 1000000).toFixed(1)}M`} icon={<TrendingUp className="w-4 h-4 text-[#FFD700]"/>} />
                <StatCard title="Biggest Win" value="฿ 842K" icon={<Trophy className="w-4 h-4 text-[#FFD700]"/>} />
                <StatCard title="Jackpot Pool" value={`฿ ${(jackpotPool / 1000000).toFixed(2)}M`} icon={<Flame className="w-4 h-4 text-[#FFD700]"/>} />
              </div>

              {/* Recent Drops Horizontal Bar */}
              <div className="glass-panel p-3 flex items-center gap-4 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-gray-500 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap pl-3 flex items-center gap-1.5 border-r border-[rgba(255,255,255,0.05)] pr-4">
                  <Dices className="w-4 h-4" /> Drops
                </div>
                <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1 flex-1">
                  {recentResults.map((res, i) => (
                    <div key={i} className={`px-5 py-2 rounded-lg font-mono text-sm font-black border flex-shrink-0 transition-all ${
                      i === 0 ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.2)] scale-105' : 'border-[rgba(255,255,255,0.05)] bg-[#0D0D0D] text-gray-400 hover:text-white hover:bg-[#121B2F]'
                    }`}>
                      {res.winning_number || 'WAIT'}
                    </div>
                  ))}
                  {recentResults.length === 0 && <div className="text-gray-600 text-xs italic font-bold">Waiting for history...</div>}
                </div>
              </div>

              {/* The Wheel Game Stage */}
              <div className="glass-panel p-8 lg:p-12 flex flex-col items-center justify-center relative min-h-[650px] overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
                
                {/* Round Info & Status */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                  <div className="bg-[#0D0D0D]/80 backdrop-blur-md border border-[rgba(255,255,255,0.05)] px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-lg">
                    <div className={`w-2.5 h-2.5 rounded-full ${isDrawing ? 'bg-[#FFD700] animate-pulse shadow-[0_0_10px_rgba(255,77,109,0.8)]' : 'bg-[#FFD700] shadow-[0_0_10px_rgba(0,255,102,0.8)]'}`}></div>
                    <span className={`font-black uppercase tracking-widest text-[11px] ${isDrawing ? 'text-[#FFD700]' : 'text-[#FFD700]'}`}>
                      {isDrawing ? 'Drawing Live' : 'Accepting Bets'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end bg-[#0D0D0D]/80 backdrop-blur-md border border-[rgba(255,255,255,0.05)] px-5 py-2 rounded-xl shadow-lg">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Round</span>
                    <span className="font-mono text-xl font-black text-white">#{roundNumberStr.split('-')[1] || roundNumberStr}</span>
                  </div>
                </div>

                <div className="w-full flex justify-center items-center py-10 mt-12 mb-8">
                  {isDrawing && !finalWinner ? (
                    <SpinWheel isDrawing={isDrawing} winningNumber={pendingWinner} />
                  ) : (
                    <div className={`text-8xl md:text-[200px] font-black tracking-tighter text-center w-full transition-all duration-700 ${finalWinner ? 'text-gradient-gold drop-shadow-[0_0_80px_rgba(255,215,0,0.4)] scale-110' : 'text-[#131C2A] drop-shadow-2xl'}`}>
                      {finalWinner ? finalWinner : `${mins}:${secs}`}
                    </div>
                  )}
                </div>

                <p className={`text-sm uppercase tracking-widest font-black mt-12 transition-colors ${finalWinner ? 'text-[#FFD700] animate-pulse drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'text-gray-600'}`}>
                  {isDrawing ? (finalWinner ? 'WINNING SEQUENCE CONFIRMED!' : 'WHEEL IS SPINNING...') : 'PLACE YOUR BETS FOR THE NEXT ROUND'}
                </p>
              </div>

              {/* LIVE BETS ANIMATED FEED */}
              <div className="glass-panel p-8 flex flex-col min-h-[400px] mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700] animate-pulse shadow-[0_0_10px_rgba(0,217,255,0.8)]"></div>
                    <h3 className="text-white font-black text-xl uppercase tracking-widest">Live Action</h3>
                  </div>
                </div>
                
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-[rgba(255,255,255,0.05)]">
                        <th className="pb-4 font-bold px-4">Player</th>
                        <th className="pb-4 font-bold px-4 text-center">Target</th>
                        <th className="pb-4 font-bold px-4 text-center">Multiplier</th>
                        <th className="pb-4 font-bold px-4 text-right">Wager</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveBets.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-16 text-gray-600 text-sm font-bold uppercase tracking-widest bg-[#0D0D0D]/30 rounded-xl mt-4 block">No bets placed in this round</td>
                        </tr>
                      ) : (
                        liveBets.map((bet, i) => (
                          <tr key={i} className="hover:bg-[#1E293B]/50 transition-colors border-b border-[rgba(255,255,255,0.02)] last:border-0 group animate-fade-in-down">
                            <td className="py-4 px-4 text-gray-300 font-bold text-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#121B2F] flex justify-center items-center text-xs text-white border border-[rgba(255,255,255,0.05)] group-hover:border-[#00D9FF]/30 transition-colors">
                                  <User className="w-4 h-4 text-gray-500 group-hover:text-[#FFD700] transition-colors" />
                                </div>
                                {bet.user_name}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-white font-black tracking-widest text-center">{bet.bet_number}</td>
                            <td className="py-4 px-4 text-[#FFD700] font-black text-sm text-center">x{(10 ** (bet.bet_number.length - 1)) * 9}</td>
                            <td className="py-4 px-4 text-right font-black text-[#FFD700] tracking-wider">฿ {bet.amount.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR (Bet Panel + Mini Leaderboard) (4 cols) */}
            <div className="xl:col-span-4 flex flex-col gap-8 animate-slide-up">
              
              {/* THE ADVANCED BET PANEL (NUMBER GRID) */}
              <div className="glass-panel p-6 lg:p-8 flex flex-col relative overflow-hidden border-t-2 border-t-[#FFD700] shadow-[0_30px_60px_rgba(0,0,0,0.6)] xl:sticky xl:top-24 z-20">
                <h3 className="text-2xl font-display font-black text-white text-center mb-8"><i className="fa-solid fa-gem text-[#FFD700] mr-2"></i> Select Number</h3>
                
                <div className="grid grid-cols-5 gap-3 sm:gap-4 relative z-10">
                  {[1,2,3,4,5,6,7,8,9,0].map(num => (
                    <button 
                      key={num}
                      onClick={() => { setBetNumber(num.toString()); setIsBottomSheetOpen(true); }}
                      className="aspect-square rounded-2xl bg-[#0D0D0D] border border-white/10 flex items-center justify-center font-mono text-3xl font-black text-white shadow-inner hover:border-[#FFD700] hover:text-[#FFD700] hover:shadow-[0_0_20px_rgba(255,212,0,0.6)] hover:scale-105 active:scale-95 transition-all">
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOP WINNERS (Mini Leaderboard) */}
              <div className="glass-panel p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6 border-b border-[rgba(255,255,255,0.05)] pb-4">
                  <Star className="w-5 h-5 text-[#FFD700]" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">Daily Legends</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                  {[
                    {name: 'CryptoKing', win: '42,500', target: '88'},
                    {name: 'LuckyStriker', win: '18,900', target: '7'},
                    {name: 'WhaleHunter', win: '9,400', target: '445'},
                    {name: 'NeonNinja', win: '8,200', target: '912'},
                    {name: 'StakeMaster', win: '5,100', target: '3'},
                  ].map((legend, i) => (
                    <div key={i} className="flex justify-between items-center bg-[#0D0D0D] p-4 rounded-xl border border-[rgba(255,255,255,0.02)] hover:border-[#FFD700]/30 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                          i === 0 ? 'bg-[#FFD700] text-[#0B1220]' : i === 1 ? 'bg-gray-300 text-[#0B1220]' : i === 2 ? 'bg-amber-700 text-white' : 'bg-[#1E293B] text-gray-400 border border-[rgba(255,255,255,0.05)]'
                        }`}>
                          {i+1}
                        </div>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{legend.name}</span>
                      </div>
                      <span className="text-[#FFD700] font-black text-sm tracking-wider">฿ {legend.win}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
              </>
            ) : (
              <div className="xl:col-span-12 flex flex-col items-center justify-center min-h-[600px] glass-panel animate-slide-up">
                <div className="w-24 h-24 bg-[#1E293B] rounded-full flex items-center justify-center mb-6 shadow-inner border border-[rgba(255,255,255,0.05)]">
                  <Gamepad2 className="w-12 h-12 text-[#FFD700] animate-pulse" />
                </div>
                <h2 className="text-5xl font-black text-white tracking-widest uppercase mb-4 text-center">Coming Soon</h2>
                <p className="text-gray-400 font-bold max-w-lg text-center text-lg">We are currently building the ultimate <span className="text-[#FFD700]">{activeTab.toUpperCase()}</span> experience. Stay tuned for massive updates and new games!</p>
                <button onClick={() => setActiveTab('lottery')} className="mt-10 px-10 py-4 bg-[#FFD700] text-[#0B1220] font-black uppercase tracking-widest rounded-xl hover:bg-[#00e65c] transition-transform active:scale-95 shadow-[0_0_20px_rgba(0,255,102,0.3)]">
                  Back to Lottery
                </button>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <footer className="mt-24 mb-8 pt-8 border-t border-[rgba(255,255,255,0.05)] flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <ShieldCheck className="w-4 h-4 text-[#FFD700]" /> Provably Fair
              </span>
              <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Clover className="w-4 h-4 text-[#FFD700]" /> 18+ Responsible Gaming
              </span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-600 hover:text-gray-300 text-[10px] font-bold uppercase tracking-widest transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-gray-300 text-[10px] font-bold uppercase tracking-widest transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-gray-300 text-[10px] font-bold uppercase tracking-widest transition-colors">24/7 Support</a>
            </div>
          </footer>
        </main>

        {/* MOBILE BOTTOM NAV */}
        <div className="xl:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0D0D0D]/95 backdrop-blur-lg border-t border-[rgba(255,255,255,0.05)] z-40 flex items-center justify-around px-2 pb-2">
          <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
            <Menu className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Menu</span>
          </button>
          <button onClick={() => setActiveTab('lottery')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'lottery' ? 'text-[#FFD700]' : 'text-gray-500 hover:text-white'}`}>
            <Gamepad2 className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Casino</span>
          </button>
          <button onClick={() => setIsAuthModalOpen(true)} className="flex flex-col items-center justify-center -mt-8 relative group">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#FF4D6D] to-[#b026ff] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,77,109,0.4)] border-4 border-[#0B1220] group-hover:scale-105 transition-transform">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
            <MessageSquare className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Chat</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
          </button>
        </div>
      
      {/* BOTTOM SHEET (Bet Popup) */}
      <div className={`fixed inset-0 z-[100] flex items-end justify-center ${isBottomSheetOpen ? '' : 'hidden'}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isBottomSheetOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsBottomSheetOpen(false)}></div>
        
        <div className={`relative w-full max-w-[600px] bg-[#121B2F] rounded-t-[32px] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] transition-transform duration-300 max-h-[90vh] overflow-y-auto flex flex-col ${isBottomSheetOpen ? 'translate-y-0' : 'translate-y-full'}`}>
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
                  <button key={r} onClick={() => setSelectedRound(r)} className={`p-3 rounded-xl border font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 ${selectedRound === r ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]' : 'border-white/10 bg-white/5 text-gray-300 hover:border-[#FFD700] hover:text-[#FFD700]'}`}>
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
    </div>
  );
}
