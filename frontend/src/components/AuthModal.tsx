import { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: { isOpen: boolean, onClose: () => void, onLoginSuccess: (token: string, user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { phone, password } : { name, phone, password };
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      
      if (isLogin) {
        onLoginSuccess(data.token, data.user);
        onClose();
      } else {
        setIsLogin(true); // Switch to login after register
        setError('Registration successful! Please login.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass-panel p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        <h2 className="text-3xl font-black mb-6 neon-text-blue uppercase tracking-widest text-center">
          {isLogin ? 'Access Link' : 'Register'}
        </h2>
        
        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="gaming-input p-4 rounded-xl" required />
          )}
          <input type="text" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="gaming-input p-4 rounded-xl" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="gaming-input p-4 rounded-xl" required />
          
          <button type="submit" className="gaming-btn py-4 rounded-xl font-bold uppercase mt-4">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center mt-6 text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already registered? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-neon-purple hover:text-white underline font-bold">
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
