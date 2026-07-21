import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, DollarSign, Activity, LogOut } from 'lucide-react';

axios.defaults.baseURL = 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [stats, setStats] = useState({ totalUsers: 0, totalBets: 0, totalDeposits: 0, totalWithdrawals: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchData();
    }
  }, [token, activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'dashboard') {
        const res = await axios.get('/admin/stats');
        setStats(res.data);
      } else if (activeTab === 'users') {
        const res = await axios.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'finance') {
        const res = await axios.get('/admin/transactions');
        setTransactions(res.data);
      }
    } catch (error: any) {
      console.error('Error fetching data', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { phone, password });
      if (res.data.user.role !== 'admin') {
        alert('Access Denied: Not an admin');
        return;
      }
      setToken(res.data.token);
      localStorage.setItem('adminToken', res.data.token);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  const handleUpdateBalance = async (userId: number, action: 'add' | 'deduct') => {
    const amount = prompt(`Enter amount to ${action}:`);
    if (!amount || isNaN(Number(amount))) return;
    
    try {
      await axios.post(`/admin/users/${userId}/balance`, { amount: Number(amount), action });
      alert('Balance updated');
      fetchData();
    } catch (err) {
      alert('Failed to update balance');
    }
  };

  const handleTransaction = async (txId: number, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this transaction?`)) return;
    try {
      await axios.post(`/admin/transactions/${txId}/${action}`);
      alert(`Transaction ${action}d`);
      fetchData();
    } catch (err) {
      alert(`Failed to ${action} transaction`);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <h1 className="text-3xl font-black text-center text-blue-400 mb-8 tracking-widest uppercase">Admin Portal</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <input 
              type="text" placeholder="Admin Phone (0000000000)" value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className="p-4 bg-gray-900 text-white rounded-lg border border-gray-700 outline-none focus:border-blue-500 transition-colors"
            />
            <input 
              type="password" placeholder="Password (admin123)" value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="p-4 bg-gray-900 text-white rounded-lg border border-gray-700 outline-none focus:border-blue-500 transition-colors"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-lg font-black uppercase tracking-widest transition-colors mt-2">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-72 bg-gray-800 p-6 flex flex-col gap-3 shadow-xl border-r border-gray-700">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8 tracking-widest uppercase text-center border-b border-gray-700 pb-6">SUPER ADMIN</h2>
        
        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-4 p-4 rounded-xl transition-colors font-bold ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
          <Activity size={22} /> Dashboard Overview
        </button>
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-4 p-4 rounded-xl transition-colors font-bold ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
          <Users size={22} /> Users & Balances
        </button>
        <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-4 p-4 rounded-xl transition-colors font-bold ${activeTab === 'finance' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
          <DollarSign size={22} /> Finance & Requests
        </button>
        
        <div className="mt-auto pt-8 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 p-4 text-red-400 hover:bg-red-500/10 font-bold rounded-xl w-full transition-colors border border-red-500/20">
            <LogOut size={20} /> Terminate Session
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        
        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-black mb-10 tracking-wide">Platform Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                <div className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-3">Total Users</div>
                <div className="text-5xl font-black">{stats.totalUsers}</div>
              </div>
              <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
                <div className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-3">Total Bets Placed</div>
                <div className="text-5xl font-black text-purple-400">{stats.totalBets}</div>
              </div>
              <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
                <div className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-3">Total Deposits</div>
                <div className="text-4xl font-black text-green-400 mt-2">฿ {stats.totalDeposits.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors"></div>
                <div className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-3">Total Withdrawals</div>
                <div className="text-4xl font-black text-red-400 mt-2">฿ {stats.totalWithdrawals.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-black mb-10 tracking-wide">User Management</h1>
            <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-gray-900 border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-6">ID</th>
                    <th className="p-6">Name</th>
                    <th className="p-6">Phone</th>
                    <th className="p-6">Wallet Balance</th>
                    <th className="p-6">Role</th>
                    <th className="p-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                      <td className="p-6 text-gray-400 font-mono">#{user.id}</td>
                      <td className="p-6 font-bold">{user.name}</td>
                      <td className="p-6 font-mono text-gray-300">{user.phone}</td>
                      <td className="p-6 text-green-400 font-black text-lg">฿ {user.wallet.toLocaleString()}</td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-700 text-gray-400 border border-gray-600'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-6 flex gap-3">
                        <button onClick={() => handleUpdateBalance(user.id, 'add')} className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/40 rounded-lg transition-colors text-sm font-bold">Add Funds</button>
                        <button onClick={() => handleUpdateBalance(user.id, 'deduct')} className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/40 rounded-lg transition-colors text-sm font-bold">Deduct</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-black mb-10 tracking-wide">Finance & Requests</h1>
            <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-gray-900 border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-6">Tx ID</th>
                    <th className="p-6">User Details</th>
                    <th className="p-6">Request Type</th>
                    <th className="p-6">Amount</th>
                    <th className="p-6">Status</th>
                    <th className="p-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-750 transition-colors">
                      <td className="p-6 text-gray-400 font-mono">#{tx.id}</td>
                      <td className="p-6">
                        <div className="font-bold">{tx.user.name}</div>
                        <div className="text-xs font-mono text-gray-400 mt-1">{tx.user.phone}</div>
                      </td>
                      <td className="p-6">
                        <span className={`font-black uppercase tracking-widest text-sm ${tx.type === 'deposit' ? 'text-green-400' : 'text-blue-400'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-6 font-black text-xl">฿ {tx.amount.toLocaleString()}</td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest border ${
                          tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                          tx.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-6 flex gap-3">
                        {tx.status === 'pending' ? (
                          <>
                            <button onClick={() => handleTransaction(tx.id, 'approve')} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors text-sm shadow-lg shadow-green-900/50">Approve</button>
                            <button onClick={() => handleTransaction(tx.id, 'reject')} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors text-sm shadow-lg shadow-red-900/50">Reject</button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
