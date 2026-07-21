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
          amount: Number(betAmount)
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setBetNumber('');
      setBetAmount('');
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
    <div className="bg-[#131C2A] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 flex items-center gap-4 hover:bg-[#1A2536] transition-colors shadow-lg">
      <div className="w-10 h-10 rounded-full bg-[#0B1220] flex items-center justify-center shadow-inner border border-[rgba(255,255,255,0.02)]">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{title}</span>
        <span className="text-white font-black text-lg">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0B1220] text-white overflow-hidden font-sans">
      
      {finalWinner && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={800} gravity={0.15} colors={['#00FF66', '#00D9FF', '#FFD700', '#FF4D6D', '#FFFFFF']} />
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={handleLoginSuccess} />

      {/* MOBILE OVERLAY */}
      <div className={`fixed inset-0 bg-black/60 z-30 transition-opacity xl:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      {/* LEFT SIDEBAR */}
      <aside className={`fixed xl:static inset-y-0 left-0 w-64 bg-[#131C2A] border-r border-[rgba(255,255,255,0.05)] flex flex-col flex-shrink-0 z-40 transition-transform duration-300 shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}`}>
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[rgba(255,255,255,0.05)]">
          <div className="w-8 h-8 rounded-lg bg-[#00FF66] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.4)]">
            <span className="font-black text-xl text-[#0B1220]">T</span>
          </div>
          <h1 className="text-xl font-black tracking-widest uppercase">
            <span className="text-white">THAI</span><span className="text-[#00FF66]">NXT</span>
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1 custom-scrollbar">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-3">Casino</div>
          <button onClick={() => setActiveTab('lottery')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'lottery' ? 'bg-[#1A2536] text-white border-l-2 border-[#00FF66] shadow-[inset_0_0_20px_rgba(0,255,102,0.05)]' : 'text-gray-400 hover:bg-[#1A2536] hover:text-white group hover:translate-x-1'}`}>
            <Hash className={`w-5 h-5 ${activeTab === 'lottery' ? 'text-[#00FF66]' : 'group-hover:text-[#00FF66] transition-colors'}`} /> Thai Lottery
          </button>
          <button onClick={() => setActiveTab('popular')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'popular' ? 'bg-[#1A2536] text-white border-l-2 border-[#00FF66] shadow-[inset_0_0_20px_rgba(0,255,102,0.05)]' : 'text-gray-400 hover:bg-[#1A2536] hover:text-white group hover:translate-x-1'}`}>
            <Flame className={`w-5 h-5 ${activeTab === 'popular' ? 'text-[#FF4D6D]' : 'group-hover:text-[#FF4D6D] transition-colors'}`} /> Popular
          </button>
          <button onClick={() => setActiveTab('slots')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'slots' ? 'bg-[#1A2536] text-white border-l-2 border-[#00FF66] shadow-[inset_0_0_20px_rgba(0,255,102,0.05)]' : 'text-gray-400 hover:bg-[#1A2536] hover:text-white group hover:translate-x-1'}`}>
            <Gamepad2 className={`w-5 h-5 ${activeTab === 'slots' ? 'text-[#00D9FF]' : 'group-hover:text-[#00D9FF] transition-colors'}`} /> Slots
          </button>
          <button onClick={() => setActiveTab('roulette')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'roulette' ? 'bg-[#1A2536] text-white border-l-2 border-[#00FF66] shadow-[inset_0_0_20px_rgba(0,255,102,0.05)]' : 'text-gray-400 hover:bg-[#1A2536] hover:text-white group hover:translate-x-1'}`}>
            <PlayCircle className={`w-5 h-5 ${activeTab === 'roulette' ? 'text-[#FFD700]' : 'group-hover:text-[#FFD700] transition-colors'}`} /> Roulette
          </button>
          
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-6 mb-2 px-3">Rewards & Stats</div>
          <button onClick={() => setActiveTab('promotions')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'promotions' ? 'bg-[#1A2536] text-white border-l-2 border-[#00FF66] shadow-[inset_0_0_20px_rgba(0,255,102,0.05)]' : 'text-gray-400 hover:bg-[#1A2536] hover:text-white group hover:translate-x-1'}`}>
            <Gift className={`w-5 h-5 ${activeTab === 'promotions' ? 'text-[#00FF66]' : 'group-hover:text-[#00FF66] transition-colors'}`} /> Promotions
          </button>
          <button onClick={() => setActiveTab('vip')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'vip' ? 'bg-[#1A2536] text-white border-l-2 border-[#00FF66] shadow-[inset_0_0_20px_rgba(0,255,102,0.05)]' : 'text-gray-400 hover:bg-[#1A2536] hover:text-white group hover:translate-x-1'}`}>
            <Star className={`w-5 h-5 ${activeTab === 'vip' ? 'text-[#FFD700]' : 'group-hover:text-[#FFD700] transition-colors'}`} /> VIP Club
          </button>
          <button onClick={() => setActiveTab('leaderboard')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-[#1A2536] text-white border-l-2 border-[#00FF66] shadow-[inset_0_0_20px_rgba(0,255,102,0.05)]' : 'text-gray-400 hover:bg-[#1A2536] hover:text-white group hover:translate-x-1'}`}>
            <Trophy className={`w-5 h-5 ${activeTab === 'leaderboard' ? 'text-[#00D9FF]' : 'group-hover:text-[#00D9FF] transition-colors'}`} /> Leaderboard
          </button>
        </div>
        
        <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[#0B1220]/50">
          <button className="flex items-center justify-center gap-2 w-full py-3 bg-[#1A2536] hover:bg-[rgba(0,255,102,0.1)] hover:text-[#00FF66] text-gray-400 rounded-xl font-bold transition-all border border-[rgba(255,255,255,0.02)]">
            <Headset className="w-4 h-4" /> Live Support
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-[#0B1220]/90 backdrop-blur-lg border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-4 lg:px-8 z-20 flex-shrink-0 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="xl:hidden text-gray-400 hover:text-white"><Menu /></button>
            <div className="xl:hidden flex items-center gap-2">
              <span className="text-[#00FF66] font-black text-xl">THAINXT</span>
            </div>
            
            <div className="hidden lg:flex items-center bg-[#131C2A] rounded-full px-4 py-2.5 border border-[rgba(255,255,255,0.05)] focus-within:border-[#00FF66] transition-colors w-[300px]">
              <Search className="w-4 h-4 text-gray-500 mr-3" />
              <input type="text" placeholder="Search games, slots..." className="bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-600 w-full font-bold" />
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-6">
            {user ? (
              <>
                <div className="flex items-center bg-[#131C2A] rounded-xl border border-[rgba(255,255,255,0.05)] shadow-inner overflow-hidden">
                  <div className="px-5 py-2.5 flex items-center gap-2 border-r border-[rgba(255,255,255,0.05)] bg-[#0B1220]/50">
                    <span className="text-[#00FF66] font-black text-sm md:text-base tracking-widest">฿ {user.wallet?.toLocaleString()}</span>
                  </div>
                  <button className="bg-[#00D9FF] hover:bg-[#00b8e6] text-[#0B1220] font-black px-5 py-2.5 text-sm uppercase tracking-widest transition-colors flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> <span className="hidden md:inline">Deposit</span>
                  </button>
                </div>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-[#131C2A] p-1.5 pr-4 rounded-full transition-colors border border-transparent hover:border-[rgba(255,255,255,0.05)]">
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#FF4D6D] to-[#b026ff] rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setIsAuthModalOpen(true)} className="text-white hover:text-[#00FF66] font-bold text-sm px-4 py-2 transition-colors uppercase tracking-widest">Sign In</button>
                <button onClick={() => setIsAuthModalOpen(true)} className="bg-[#00FF66] hover:bg-[#00e65c] text-[#0B1220] px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)]">Register</button>
              </div>
            )}
          </div>
        </header>

        {/* SCROLLABLE MAIN AREA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-28 lg:p-8 lg:pb-8 relative bg-gradient-to-b from-[#0B1220] to-[#05080F]">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#00FF66] opacity-[0.02] rounded-full blur-[150px] pointer-events-none"></div>
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#00D9FF] opacity-[0.02] rounded-full blur-[150px] pointer-events-none"></div>

          <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
            {activeTab === 'lottery' ? (
              <>
            {/* CENTER STAGE (Left 8 cols on desktop) */}
            <div className="xl:col-span-8 flex flex-col gap-8">
              
              {/* Premium Live Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
                <StatCard title="Players Online" value={onlinePlayers.toLocaleString()} icon={<User className="w-4 h-4 text-[#00D9FF]"/>} />
                <StatCard title="Total Wagered" value={`฿ ${(totalWagered / 1000000).toFixed(1)}M`} icon={<TrendingUp className="w-4 h-4 text-[#FFD700]"/>} />
                <StatCard title="Biggest Win" value="฿ 842K" icon={<Trophy className="w-4 h-4 text-[#00FF66]"/>} />
                <StatCard title="Jackpot Pool" value={`฿ ${(jackpotPool / 1000000).toFixed(2)}M`} icon={<Flame className="w-4 h-4 text-[#FF4D6D]"/>} />
              </div>

              {/* Recent Drops Horizontal Bar */}
              <div className="glass-panel p-3 flex items-center gap-4 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-gray-500 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap pl-3 flex items-center gap-1.5 border-r border-[rgba(255,255,255,0.05)] pr-4">
                  <Dices className="w-4 h-4" /> Drops
                </div>
                <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1 flex-1">
                  {recentResults.map((res, i) => (
                    <div key={i} className={`px-5 py-2 rounded-lg font-mono text-sm font-black border flex-shrink-0 transition-all ${
                      i === 0 ? 'border-[#00FF66] bg-[#00FF66]/10 text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.2)] scale-105' : 'border-[rgba(255,255,255,0.05)] bg-[#0B1220] text-gray-400 hover:text-white hover:bg-[#131C2A]'
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
                  <div className="bg-[#0B1220]/80 backdrop-blur-md border border-[rgba(255,255,255,0.05)] px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-lg">
                    <div className={`w-2.5 h-2.5 rounded-full ${isDrawing ? 'bg-[#FF4D6D] animate-pulse shadow-[0_0_10px_rgba(255,77,109,0.8)]' : 'bg-[#00FF66] shadow-[0_0_10px_rgba(0,255,102,0.8)]'}`}></div>
                    <span className={`font-black uppercase tracking-widest text-[11px] ${isDrawing ? 'text-[#FF4D6D]' : 'text-[#00FF66]'}`}>
                      {isDrawing ? 'Drawing Live' : 'Accepting Bets'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end bg-[#0B1220]/80 backdrop-blur-md border border-[rgba(255,255,255,0.05)] px-5 py-2 rounded-xl shadow-lg">
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
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00D9FF] animate-pulse shadow-[0_0_10px_rgba(0,217,255,0.8)]"></div>
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
                          <td colSpan={4} className="text-center py-16 text-gray-600 text-sm font-bold uppercase tracking-widest bg-[#0B1220]/30 rounded-xl mt-4 block">No bets placed in this round</td>
                        </tr>
                      ) : (
                        liveBets.map((bet, i) => (
                          <tr key={i} className="hover:bg-[#1A2536]/50 transition-colors border-b border-[rgba(255,255,255,0.02)] last:border-0 group animate-fade-in-down">
                            <td className="py-4 px-4 text-gray-300 font-bold text-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#131C2A] flex justify-center items-center text-xs text-white border border-[rgba(255,255,255,0.05)] group-hover:border-[#00D9FF]/30 transition-colors">
                                  <User className="w-4 h-4 text-gray-500 group-hover:text-[#00D9FF] transition-colors" />
                                </div>
                                {bet.user_name}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-white font-black tracking-widest text-center">{bet.bet_number}</td>
                            <td className="py-4 px-4 text-[#00D9FF] font-black text-sm text-center">x{(10 ** (bet.bet_number.length - 1)) * 9}</td>
                            <td className="py-4 px-4 text-right font-black text-[#00FF66] tracking-wider">฿ {bet.amount.toLocaleString()}</td>
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
              
              {/* THE ADVANCED BET PANEL */}
              <div className="glass-panel p-8 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-[#00FF66]/20">
                
                {/* Tabs */}
                <div className="flex bg-[#0B1220] p-1.5 rounded-xl mb-8 border border-[rgba(255,255,255,0.05)] shadow-inner">
                  <button className="flex-1 bg-[#1A2536] text-white py-3 rounded-lg font-black text-[11px] uppercase tracking-widest shadow-md">Manual</button>
                  <button className="flex-1 text-gray-500 hover:text-white py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-colors">Auto Bet</button>
                </div>

                {/* Input Form */}
                <div className="flex flex-col gap-6 flex-grow">
                  
                  {/* Target Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest flex justify-between">
                      <span>Target Sequence</span>
                      <span className="text-[#00D9FF]">1-4 Digits</span>
                    </label>
                    <div className="casino-input rounded-xl p-2 focus-within:bg-[#0B1220] transition-colors">
                      <input 
                        type="text" 
                        value={betNumber}
                        onChange={(e) => setBetNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full bg-transparent text-white font-mono text-4xl p-4 text-center tracking-[0.4em] outline-none placeholder:text-[#1A2536] font-black"
                        placeholder="0000"
                      />
                    </div>
                  </div>

                  {/* Stake Input */}
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest flex justify-between">
                      <span>Bet Amount</span>
                      <span className="text-[#FFD700]">฿</span>
                    </label>
                    <div className="casino-input rounded-xl flex items-center p-2 relative overflow-hidden focus-within:bg-[#0B1220] transition-colors">
                      <div className="absolute inset-y-0 left-0 bg-[#1A2536] border-r border-[rgba(255,255,255,0.05)] px-4 flex items-center justify-center z-10">
                        <img src="/coin.png" className="w-5 h-5" alt="coin" />
                      </div>
                      <input 
                        type="number" 
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="w-full bg-transparent text-white font-black text-2xl p-4 pl-20 outline-none placeholder:text-[#1A2536] relative z-0"
                        placeholder="0.00"
                      />
                    </div>
                    
                    {/* Quick Chips */}
                    <div className="grid grid-cols-5 gap-2 mt-3">
                      {['1/2', '2x', '+100', '+1K', 'MAX'].map(btn => {
                        const handleClick = () => {
                          const current = Number(betAmount) || 0;
                          if(btn === '1/2') setBetAmount(Math.floor(current / 2).toString());
                          if(btn === '2x') setBetAmount((current * 2).toString());
                          if(btn === '+100') setBetAmount((current + 100).toString());
                          if(btn === '+1K') setBetAmount((current + 1000).toString());
                          if(btn === 'MAX' && user?.wallet) setBetAmount(user.wallet.toString());
                        };
                        return (
                          <button key={btn} onClick={handleClick} className="bg-[#1A2536] hover:bg-[#2A3B52] py-2.5 rounded-lg text-[10px] font-black text-gray-300 transition-colors border border-[rgba(255,255,255,0.05)] uppercase tracking-wider hover:text-white">
                            {btn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Advanced Toggles (Visual only) */}
                  <div className="flex items-center justify-between border-y border-[rgba(255,255,255,0.05)] py-4 mt-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Risk Level</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-[#00FF66]/20 text-[#00FF66] text-[10px] font-bold rounded uppercase tracking-wider border border-[#00FF66]/30">Low</button>
                      <button className="px-3 py-1 bg-[#1A2536] text-gray-500 text-[10px] font-bold rounded uppercase tracking-wider border border-[rgba(255,255,255,0.05)]">High</button>
                    </div>
                  </div>

                  {/* Statistics Modifiers */}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-[#0B1220] rounded-xl p-4 border border-[rgba(255,255,255,0.05)] flex flex-col items-center justify-center gap-1">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Win Chance</span>
                      <span className="text-white font-black text-xl">{winChance.toFixed(2)}%</span>
                    </div>
                    <div className="bg-[#0B1220] rounded-xl p-4 border border-[rgba(255,255,255,0.05)] flex flex-col items-center justify-center gap-1">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Multiplier</span>
                      <span className="text-[#00D9FF] font-black text-xl">x{betNumber ? (10 ** (betNumber.length - 1)) * 9 : 0}</span>
                    </div>
                  </div>

                  {/* Payout Info */}
                  <div className="mt-4 bg-[#0B1220] rounded-xl p-5 border border-[#00FF66]/30 flex justify-between items-center shadow-[inset_0_0_20px_rgba(0,255,102,0.05)]">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Estimated Payout</span>
                    <span className="text-[#00FF66] font-black text-2xl flex items-center gap-2 tracking-wider">
                      ฿ {possiblePrize.toLocaleString()}
                    </span>
                  </div>

                  <button 
                    onClick={handlePlaceBet}
                    disabled={!betNumber || !betAmount || totalSeconds === 0}
                    className="w-full bg-[#00FF66] hover:bg-[#00e65c] disabled:bg-[#1A2536] disabled:text-gray-600 text-[#0B1220] py-6 rounded-xl font-black uppercase tracking-widest text-lg transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(0,255,102,0.3)] disabled:shadow-none mt-2 relative overflow-hidden group"
                  >
                    <span className="relative z-10">{totalSeconds === 0 ? 'Wait for Next Round' : 'Place Bet'}</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>
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
                    <div key={i} className="flex justify-between items-center bg-[#0B1220] p-4 rounded-xl border border-[rgba(255,255,255,0.02)] hover:border-[#FFD700]/30 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                          i === 0 ? 'bg-[#FFD700] text-[#0B1220]' : i === 1 ? 'bg-gray-300 text-[#0B1220]' : i === 2 ? 'bg-amber-700 text-white' : 'bg-[#1A2536] text-gray-400 border border-[rgba(255,255,255,0.05)]'
                        }`}>
                          {i+1}
                        </div>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{legend.name}</span>
                      </div>
                      <span className="text-[#00FF66] font-black text-sm tracking-wider">฿ {legend.win}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
              </>
            ) : (
              <div className="xl:col-span-12 flex flex-col items-center justify-center min-h-[600px] glass-panel animate-slide-up">
                <div className="w-24 h-24 bg-[#1A2536] rounded-full flex items-center justify-center mb-6 shadow-inner border border-[rgba(255,255,255,0.05)]">
                  <Gamepad2 className="w-12 h-12 text-[#00D9FF] animate-pulse" />
                </div>
                <h2 className="text-5xl font-black text-white tracking-widest uppercase mb-4 text-center">Coming Soon</h2>
                <p className="text-gray-400 font-bold max-w-lg text-center text-lg">We are currently building the ultimate <span className="text-[#00FF66]">{activeTab.toUpperCase()}</span> experience. Stay tuned for massive updates and new games!</p>
                <button onClick={() => setActiveTab('lottery')} className="mt-10 px-10 py-4 bg-[#00FF66] text-[#0B1220] font-black uppercase tracking-widest rounded-xl hover:bg-[#00e65c] transition-transform active:scale-95 shadow-[0_0_20px_rgba(0,255,102,0.3)]">
                  Back to Lottery
                </button>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <footer className="mt-24 mb-8 pt-8 border-t border-[rgba(255,255,255,0.05)] flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <ShieldCheck className="w-4 h-4 text-[#00FF66]" /> Provably Fair
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
        <div className="xl:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0B1220]/95 backdrop-blur-lg border-t border-[rgba(255,255,255,0.05)] z-40 flex items-center justify-around px-2 pb-2">
          <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
            <Menu className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Menu</span>
          </button>
          <button onClick={() => setActiveTab('lottery')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'lottery' ? 'text-[#00FF66]' : 'text-gray-500 hover:text-white'}`}>
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
      </div>
    </div>
  );
}
