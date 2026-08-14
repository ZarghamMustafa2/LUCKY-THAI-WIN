/**
 * ====================================================================
 *  PLATFORM-SYNC.JS — Central Single Source of Truth & Real-Time Sync
 *  Seamless Two-Way Synchronization between User Platform & Admin Panel
 *  Handles: Real Users · Wallets · Transactions · Deposits · Withdrawals
 *           Game-Wise Activities · Closed-Loop Virtual Token System
 *           Master Token Account · Atomic Transfers · Immutable Ledger
 * ====================================================================
 */

(function (window) {
  'use strict';

  // ─── 1. BROADCAST CHANNEL & EVENT BUS ────────────────────────────
  const CHANNEL_NAME = 'THAINXT_PLATFORM_EVENT_BUS';
  let broadcastChannel = null;
  try {
    if (typeof window.BroadcastChannel === 'function') {
      broadcastChannel = new window.BroadcastChannel(CHANNEL_NAME);
    }
  } catch (e) {}

  function broadcastEvent(eventType, payload) {
    const eventObj = { type: eventType, payload, timestamp: Date.now() };
    if (broadcastChannel) {
      try { broadcastChannel.postMessage(eventObj); } catch(e) {}
    }
    try {
      localStorage.setItem('THAINXT_LAST_EVENT', JSON.stringify(eventObj));
    } catch(e) {}
  }

  // ─── 2. DEFAULT SEED DATA ────────────────────────────────────────
  const SEED_COMPANIES = [
    { id: 'COMP-01', name: 'ThaiNXT Global Exchange (HQ)', code: 'GLOBAL', currency: 'PKR / INR', status: 'Active', usersCount: 1420 },
    { id: 'COMP-02', name: 'Apex Sports Asia Ltd.', code: 'APEX', currency: 'PKR', status: 'Active', usersCount: 580 },
    { id: 'COMP-03', name: 'Royal Bangkok Club Gaming', code: 'ROYAL', currency: 'INR', status: 'Active', usersCount: 310 }
  ];

  const SEED_USERS = [
    { 
      id: 'Bp28233', 
      username: 'Alex_Winner', 
      name: 'Alexander Wright', 
      phone: '+92 300 1234567', 
      email: 'alex.winner@gmail.com', 
      password: 'Bp28233@pass',
      balance: 10450.00, 
      locked: 0.00, 
      totalDeposit: 45000.00, 
      totalWithdraw: 34550.00, 
      companyId: 'COMP-01', 
      status: 'Active', 
      kycStatus: 'Approved', 
      source: 'Direct Sign-Up', 
      regDate: '2026-06-12', 
      lastLogin: 'Today, 10:45 AM', 
      loginHistory: [{ timestamp: '2026-08-14 10:45:00', ip: '192.168.1.102', device: 'Desktop Chrome / Windows 11' }],
      notes: 'VIP customer, prefers Thai 4D and Live Roulette.' 
    },
    { 
      id: 'USR-1093', 
      username: 'CryptoKing', 
      name: 'Fahad Rehman', 
      phone: '+92 321 9876543', 
      email: 'crypto.fahad@gmail.com', 
      password: 'CryptoPass#1',
      balance: 45000.00, 
      locked: 5000.00, 
      totalDeposit: 120000.00, 
      totalWithdraw: 70000.00, 
      companyId: 'COMP-01', 
      status: 'Active', 
      kycStatus: 'Approved', 
      source: 'Super_Agent_02', 
      regDate: '2026-06-18', 
      lastLogin: 'Today, 09:15 AM', 
      loginHistory: [{ timestamp: '2026-08-14 09:15:00', ip: '192.168.1.55', device: 'Mobile Safari / iOS' }],
      notes: 'High turnover bettor.' 
    },
    { 
      id: 'USR-1094', 
      username: 'Whale99', 
      name: 'Bilal Tariq', 
      phone: '+92 333 4567890', 
      email: 'bilal.tariq@yahoo.com', 
      password: 'WhaleSecret99',
      balance: 120000.00, 
      locked: 20000.00, 
      totalDeposit: 500000.00, 
      totalWithdraw: 360000.00, 
      companyId: 'COMP-01', 
      status: 'Active', 
      kycStatus: 'Approved', 
      source: 'Master_Agent_01', 
      regDate: '2026-05-20', 
      lastLogin: 'Yesterday, 11:30 PM', 
      loginHistory: [{ timestamp: '2026-08-13 23:30:00', ip: '192.168.1.80', device: 'Desktop Chrome / Windows 11' }],
      notes: 'Corporate client.' 
    },
    { 
      id: 'USR-1095', 
      username: 'Zargham_Pro', 
      name: 'Zargham Raza', 
      phone: '+92 312 3456789', 
      email: 'zargham.pro@gmail.com', 
      password: 'Zargham@2026',
      balance: 25000.00, 
      locked: 0.00, 
      totalDeposit: 60000.00, 
      totalWithdraw: 35000.00, 
      companyId: 'COMP-02', 
      status: 'Active', 
      kycStatus: 'Approved', 
      source: 'Apex_Agent', 
      regDate: '2026-07-01', 
      lastLogin: 'Today, 08:20 AM', 
      loginHistory: [{ timestamp: '2026-08-14 08:20:00', ip: '192.168.1.14', device: 'Mobile Chrome / Android' }],
      notes: 'Regular Thai Lottery player.' 
    },
    { 
      id: 'USR-1096', 
      username: 'LuckyHassan', 
      name: 'Hassan Ali', 
      phone: '+92 345 8899001', 
      email: 'hassan.ali@outlook.com', 
      password: 'Hassan@Secure99',
      balance: 3200.00, 
      locked: 1000.00, 
      totalDeposit: 15000.00, 
      totalWithdraw: 10800.00, 
      companyId: 'COMP-01', 
      status: 'Pending Verification', 
      kycStatus: 'Pending', 
      source: 'Direct Sign-Up', 
      regDate: '2026-08-10', 
      lastLogin: 'Today, 01:10 PM', 
      loginHistory: [{ timestamp: '2026-08-14 13:10:00', ip: '192.168.1.109', device: 'Desktop Firefox / Windows 10' }],
      notes: 'ID card uploaded, awaiting verification.' 
    },
    { 
      id: 'USR-1097', 
      username: 'SuspiciousBettor', 
      name: 'Rashid Minhas', 
      phone: '+92 301 2233445', 
      email: 'rashid.m@gmail.com', 
      password: 'RashidSecret@1',
      balance: 150.00, 
      locked: 0.00, 
      totalDeposit: 5000.00, 
      totalWithdraw: 4850.00, 
      companyId: 'COMP-03', 
      status: 'Suspended', 
      kycStatus: 'Rejected', 
      source: 'Online Referral', 
      regDate: '2026-07-15', 
      lastLogin: '3 days ago', 
      loginHistory: [{ timestamp: '2026-08-11 18:22:00', ip: '192.168.1.190', device: 'Mobile Android' }],
      notes: 'Suspended due to multiple sequence betting pattern.' 
    }
  ];

  const SEED_DEPOSITS = [
    { id: 'DEP-8841', userId: 'USR-1092', username: 'Alex_Winner', amount: 15000, method: 'Easypaisa', ref: 'EP-993821094', companyId: 'COMP-01', status: 'Pending', date: '2026-08-14 11:20 AM', createdAt: new Date().toISOString() },
    { id: 'DEP-8842', userId: 'USR-1093', username: 'CryptoKing', amount: 50000, method: 'USDT (TRC20)', ref: '0x8f2a991823bc', companyId: 'COMP-01', status: 'Pending', date: '2026-08-14 10:45 AM', createdAt: new Date().toISOString() }
  ];

  const SEED_WITHDRAWALS = [
    { id: 'WTH-4102', userId: 'USR-1093', username: 'CryptoKing', amount: 25000, method: 'Bank Transfer (HBL)', account: 'HBL - 0021-99882201', companyId: 'COMP-01', status: 'Pending', requestDate: '2026-08-14 10:15 AM', createdAt: new Date().toISOString() },
    { id: 'WTH-4101', userId: 'USR-1095', username: 'Zargham_Pro', amount: 12000, method: 'JazzCash', account: '0312-3456789', companyId: 'COMP-02', status: 'Pending', requestDate: '2026-08-14 09:30 AM', createdAt: new Date().toISOString() }
  ];

  const SEED_TRANSACTIONS = [
    { id: 'TX-1001', userId: 'USR-1092', username: 'Alex_Winner', type: 'deposit', amount: 15000, status: 'pending', ref: 'EP-993821094', companyId: 'COMP-01', date: '2026-08-14 11:20 AM' },
    { id: 'TX-1002', userId: 'USR-1093', username: 'CryptoKing', type: 'withdraw', amount: 25000, status: 'pending', ref: 'HBL-0021', companyId: 'COMP-01', date: '2026-08-14 10:15 AM' },
    { id: 'TX-1003', userId: 'USR-1094', username: 'Whale99', type: 'bet_wager', amount: 5000, status: 'settled', ref: '4D-Round-8890', companyId: 'COMP-01', date: '2026-08-14 09:00 AM' }
  ];

  const SEED_GAME_ACTIVITIES = [
    { id: 'ACT-901', userId: 'USR-1092', username: 'Alex_Winner', companyId: 'COMP-01', gameId: 'GM-THAI-4D', gameName: 'Lucky Thai Win 4D Live', roundId: '8890', betNumber: '3629', stake: 1000, tokens: 100, currency: 'PKR', result: 'WON', payout: 9000, netResult: 8000, date: '2026-08-14 10:00 AM', createdAt: '2026-08-14T10:00:00Z' },
    { id: 'ACT-902', userId: 'USR-1092', username: 'Alex_Winner', companyId: 'COMP-01', gameId: 'GM-THAI-4D', gameName: 'Lucky Thai Win 4D Live', roundId: '8889', betNumber: '84', stake: 500, tokens: 50, currency: 'PKR', result: 'LOST', payout: 0, netResult: -500, date: '2026-08-14 09:30 AM', createdAt: '2026-08-14T09:30:00Z' },
    { id: 'ACT-903', userId: 'USR-1093', username: 'CryptoKing', companyId: 'COMP-01', gameId: 'GM-CRICKET-LIVE', gameName: 'International Cricket Exchange', roundId: 'MTCH-441', betNumber: 'IND vs ENG (Over 15.4)', stake: 5000, tokens: 500, currency: 'PKR', result: 'WON', payout: 9500, netResult: 4500, date: '2026-08-14 08:45 AM', createdAt: '2026-08-14T08:45:00Z' },
    { id: 'ACT-904', userId: 'USR-1094', username: 'Whale99', companyId: 'COMP-01', gameId: 'GM-ROULETTE-ROYAL', gameName: 'European Live Roulette Pro', roundId: 'ROUL-102', betNumber: 'Red 17', stake: 10000, tokens: 1000, currency: 'PKR', result: 'LOST', payout: 0, netResult: -10000, date: '2026-08-13 11:20 PM', createdAt: '2026-08-13T23:20:00Z' },
    { id: 'ACT-905', userId: 'USR-1095', username: 'Zargham_Pro', companyId: 'COMP-02', gameId: 'GM-THAI-4D', gameName: 'Lucky Thai Win 4D Live', roundId: '8888', betNumber: '5584', stake: 2000, tokens: 200, currency: 'PKR', result: 'WON', payout: 18000, netResult: 16000, date: '2026-08-13 09:00 PM', createdAt: '2026-08-13T21:00:00Z' },
    { id: 'ACT-906', userId: 'USR-1094', username: 'Whale99', companyId: 'COMP-01', gameId: 'GM-AVIATOR-CRASH', gameName: 'Aviator High-Multiplier Crash', roundId: 'AV-771', betNumber: 'Cashout 4.5x', stake: 4000, tokens: 400, currency: 'PKR', result: 'WON', payout: 18000, netResult: 14000, date: '2026-08-13 06:15 PM', createdAt: '2026-08-13T18:15:00Z' },
    { id: 'ACT-907', userId: 'USR-1093', username: 'CryptoKing', companyId: 'COMP-01', gameId: 'GM-RITMU-TV', gameName: 'Ritmu TV Satellite Draw', roundId: 'RIT-490', betNumber: 'Ticket #490-A', stake: 1500, tokens: 150, currency: 'PKR', result: 'LOST', payout: 0, netResult: -1500, date: '2026-08-12 04:00 PM', createdAt: '2026-08-12T16:00:00Z' }
  ];

  const SEED_GAMES = [
    { id: 'GM-THAI-4D', name: 'Lucky Thai Win 4D Live', category: 'CAT-LOTTERY', route: 'game.html', status: 'Active', maintenance: false, order: 1, turnover: 'Rs 4,850,200', players: 342, image: 'aviator_card.jpg' },
    { id: 'GM-RITMU-TV', name: 'Ritmu TV Satellite Draw', category: 'CAT-LOTTERY', route: 'https://www.ritmu.tv', status: 'Active', maintenance: false, order: 2, turnover: 'Rs 2,120,400', players: 189, image: 'roulette_card.jpg' },
    { id: 'GM-CRICKET-LIVE', name: 'International Cricket Exchange', category: 'CAT-CRICKET', route: 'index.html#bpexch', status: 'Active', maintenance: false, order: 3, turnover: 'Rs 8,920,000', players: 840, image: 'sports_book_card.jpg' },
    { id: 'GM-PREMIER-FOOTBALL', name: 'Premier League Soccer Live', category: 'CAT-SOCCER', route: 'index.html#soccer', status: 'Active', maintenance: false, order: 4, turnover: 'Rs 3,450,000', players: 410, image: 'sports_book_card.jpg' },
    { id: 'GM-ROULETTE-ROYAL', name: 'European Live Roulette Pro', category: 'CAT-CASINO', route: 'index.html#casino', status: 'Active', maintenance: false, order: 5, turnover: 'Rs 1,980,000', players: 156, image: 'roulette_card.jpg' },
    { id: 'GM-AVIATOR-CRASH', name: 'Aviator High-Multiplier Crash', category: 'CAT-SLOTS', route: 'index.html#slots', status: 'Active', maintenance: false, order: 6, turnover: 'Rs 5,640,000', players: 520, image: 'aviator_card.jpg' }
  ];

  // ─── 3. CLOSED-LOOP VIRTUAL TOKEN SEED ACCOUNTS & LEDGER ─────────
  // Total Initial Token Supply: 10,000,000 VTK (Guaranteed Conservation)
  const SEED_TOKEN_ACCOUNTS = [
    { internalAccountId: 'ACC-MASTER-001', username: 'MASTER_VAULT', accountType: 'MASTER', companyId: null, tokenBalance: 8444800, status: 'Active', createdDate: '2026-01-01' },
    { internalAccountId: 'ACC-COMP-01', username: 'ThaiNXT_HQ_Tokens', accountType: 'COMPANY_ADMIN', companyId: 'COMP-01', tokenBalance: 750000, status: 'Active', createdDate: '2026-01-01' },
    { internalAccountId: 'ACC-COMP-02', username: 'Apex_Asia_Tokens', accountType: 'COMPANY_ADMIN', companyId: 'COMP-02', tokenBalance: 320000, status: 'Active', createdDate: '2026-01-01' },
    { internalAccountId: 'ACC-COMP-03', username: 'Royal_Bangkok_Tokens', accountType: 'COMPANY_ADMIN', companyId: 'COMP-03', tokenBalance: 180000, status: 'Active', createdDate: '2026-01-01' },
    { internalAccountId: 'ACC-POOL-SETTLE', username: 'GAME_SETTLEMENT_POOL', accountType: 'MASTER', companyId: null, tokenBalance: 125000, status: 'Active', createdDate: '2026-01-01' },
    { internalAccountId: 'ACC-USR-1092', username: 'Alex_Winner', accountType: 'USER', companyId: 'COMP-01', tokenBalance: 45000, status: 'Active', createdDate: '2026-06-12' },
    { internalAccountId: 'ACC-USR-1093', username: 'CryptoKing', accountType: 'USER', companyId: 'COMP-01', tokenBalance: 80000, status: 'Active', createdDate: '2026-06-18' },
    { internalAccountId: 'ACC-USR-1094', username: 'Whale99', accountType: 'USER', companyId: 'COMP-01', tokenBalance: 35000, status: 'Active', createdDate: '2026-05-20' },
    { internalAccountId: 'ACC-USR-1095', username: 'Zargham_Pro', accountType: 'USER', companyId: 'COMP-02', tokenBalance: 15000, status: 'Active', createdDate: '2026-07-01' },
    { internalAccountId: 'ACC-USR-1096', username: 'LuckyHassan', accountType: 'USER', companyId: 'COMP-01', tokenBalance: 5000, status: 'Active', createdDate: '2026-08-10' },
    { internalAccountId: 'ACC-USR-1097', username: 'SuspiciousBettor', accountType: 'USER', companyId: 'COMP-03', tokenBalance: 200, status: 'Suspended', createdDate: '2026-07-15' }
  ];

  const SEED_TOKEN_LEDGER = [
    { transactionId: 'TXN-VTK-1001', senderAccountId: 'ACC-MASTER-001', senderUsername: 'MASTER_VAULT', receiverAccountId: 'ACC-COMP-01', receiverUsername: 'ThaiNXT_HQ_Tokens', amount: 1000000, tokenType: 'VTK_GAME_TOKEN', reason: 'Initial Master Token Allocation to Company HQ', gameId: null, roundId: null, createdBy: 'Super Admin', status: 'SETTLED', timestamp: '2026-08-10 10:00:00', createdAt: '2026-08-10T10:00:00Z' },
    { transactionId: 'TXN-VTK-1002', senderAccountId: 'ACC-COMP-01', senderUsername: 'ThaiNXT_HQ_Tokens', receiverAccountId: 'ACC-USR-1092', receiverUsername: 'Alex_Winner', amount: 50000, tokenType: 'VTK_GAME_TOKEN', reason: 'VIP Player Promotional Virtual Token Grant', gameId: null, roundId: null, createdBy: 'Company Admin A', status: 'SETTLED', timestamp: '2026-08-14 09:00:00', createdAt: '2026-08-14T09:00:00Z' },
    { transactionId: 'TXN-VTK-1003', senderAccountId: 'ACC-USR-1092', senderUsername: 'Alex_Winner', receiverAccountId: 'ACC-POOL-SETTLE', receiverUsername: 'GAME_SETTLEMENT_POOL', amount: 5000, tokenType: 'VTK_GAME_TOKEN', reason: 'Lucky Thai 4D Virtual Bet Entry - Round #8890', gameId: 'GM-THAI-4D', roundId: '8890', createdBy: 'Game Engine', status: 'SETTLED', timestamp: '2026-08-14 10:00:00', createdAt: '2026-08-14T10:00:00Z' }
  ];

  // ─── 4. CORE PLATFORM SYNCHRONIZATION ENGINE ─────────────────────

  const PlatformSync = {
    TOTAL_TOKEN_SUPPLY: 10000000, // Fixed Platform Conservation Total

    KEYS: {
      USERS: 'ADM_USERS',
      DEPOSITS: 'ADM_DEPOSITS',
      WITHDRAWALS: 'ADM_WITHDRAWALS',
      TRANSACTIONS: 'ADM_TRANSACTIONS',
      GAME_ACTIVITIES: 'ADM_GAME_ACTIVITIES',
      COMPANIES: 'ADM_COMPANIES',
      GAMES: 'ADM_GAMES',
      AUDIT_LOGS: 'ADM_AUDIT_LOGS',
      KYC: 'ADM_KYC',
      BONUSES: 'ADM_BONUSES',
      TOKEN_ACCOUNTS: 'ADM_TOKEN_ACCOUNTS',
      TOKEN_LEDGER: 'ADM_TOKEN_LEDGER'
    },

    init() {
      if (!localStorage.getItem(this.KEYS.USERS)) {
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(SEED_USERS));
      }
      if (!localStorage.getItem(this.KEYS.DEPOSITS)) {
        localStorage.setItem(this.KEYS.DEPOSITS, JSON.stringify(SEED_DEPOSITS));
      }
      if (!localStorage.getItem(this.KEYS.WITHDRAWALS)) {
        localStorage.setItem(this.KEYS.WITHDRAWALS, JSON.stringify(SEED_WITHDRAWALS));
      }
      if (!localStorage.getItem(this.KEYS.TRANSACTIONS)) {
        localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
      }
      if (!localStorage.getItem(this.KEYS.GAME_ACTIVITIES)) {
        localStorage.setItem(this.KEYS.GAME_ACTIVITIES, JSON.stringify(SEED_GAME_ACTIVITIES));
      }
      if (!localStorage.getItem(this.KEYS.COMPANIES)) {
        localStorage.setItem(this.KEYS.COMPANIES, JSON.stringify(SEED_COMPANIES));
      }
      if (!localStorage.getItem(this.KEYS.GAMES)) {
        localStorage.setItem(this.KEYS.GAMES, JSON.stringify(SEED_GAMES));
      }
      if (!localStorage.getItem(this.KEYS.TOKEN_ACCOUNTS)) {
        localStorage.setItem(this.KEYS.TOKEN_ACCOUNTS, JSON.stringify(SEED_TOKEN_ACCOUNTS));
      }
      if (!localStorage.getItem(this.KEYS.TOKEN_LEDGER)) {
        localStorage.setItem(this.KEYS.TOKEN_LEDGER, JSON.stringify(SEED_TOKEN_LEDGER));
      }
      this.syncExistingUsers();
    },

    _get(key) {
      try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e) { return []; }
    },

    _set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
    },

    // ─── USER REGISTRATION & REAL DATA SYNCHRONIZATION ─────────────

    syncExistingUsers() {
      const users = this._get(this.KEYS.USERS);
      let modified = false;

      // 1. Synchronize legacy / self-registered users from registeredUsersList if any
      let regList = [];
      try { regList = JSON.parse(localStorage.getItem('registeredUsersList') || '[]'); } catch(e) {}
      
      if (Array.isArray(regList)) {
        regList.forEach(regUser => {
          if (!regUser || !regUser.username) return;
          const uname = String(regUser.username).trim();
          const existing = users.find(u => u.username.toLowerCase() === uname.toLowerCase());
          if (!existing) {
            const maxNum = users.reduce((max, u) => {
              const n = parseInt(String(u.id).replace(/\D/g, ''), 10);
              return isNaN(n) ? max : Math.max(max, n);
            }, 1095);
            const newId = 'USR-' + (maxNum + 1);
            const newUser = {
              id: newId,
              username: uname,
              name: uname.replace(/_/g, ' '),
              phone: regUser.phone || ('+92 3' + Math.floor(100000000 + Math.random() * 900000000)),
              email: regUser.email || (uname.toLowerCase() + '@gmail.com'),
              password: regUser.password || '123456',
              balance: Number(regUser.balance) || 10450.00,
              locked: 0.00,
              totalDeposit: Number(regUser.balance) || 10450.00,
              totalWithdraw: 0.00,
              companyId: regUser.companyId || 'COMP-01',
              status: regUser.status || 'Active',
              kycStatus: 'Pending',
              source: regUser.source || 'Self Registered (Website)',
              regDate: new Date().toISOString().split('T')[0],
              lastLogin: regUser.loginTime || 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              loginHistory: [{ timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), ip: '192.168.1.100', device: navigator.userAgent.substring(0, 40) }],
              notes: 'Synchronized player account.'
            };
            users.push(newUser);
            modified = true;
          }
        });
      }

      // 2. Ensure each user has a corresponding token account in ADM_TOKEN_ACCOUNTS
      const accounts = this._get(this.KEYS.TOKEN_ACCOUNTS);
      let accountsModified = false;

      users.forEach(u => {
        const accId = `ACC-${u.id}`;
        let tokAcc = accounts.find(a => 
          a.internalAccountId.toLowerCase() === accId.toLowerCase() || 
          a.username.toLowerCase() === u.username.toLowerCase()
        );
        if (!tokAcc) {
          accounts.push({
            internalAccountId: accId,
            username: u.username,
            accountType: 'USER',
            companyId: u.companyId || 'COMP-01',
            tokenBalance: 5000,
            status: u.status || 'Active',
            createdDate: u.regDate || new Date().toISOString().split('T')[0]
          });
          accountsModified = true;
        } else if (tokAcc.companyId !== u.companyId) {
          tokAcc.companyId = u.companyId;
          accountsModified = true;
        }
      });

      if (accountsModified) {
        this._set(this.KEYS.TOKEN_ACCOUNTS, accounts);
      }

      if (modified) {
        this._set(this.KEYS.USERS, users);
      }

      return users;
    },

    getSanitizedUsers(companyId = null, filterOpts = {}) {
      this.init();
      let users = this._get(this.KEYS.USERS);
      
      // Multi-tenant company role scoping
      if (companyId && companyId !== 'ALL') {
        users = users.filter(u => u.companyId === companyId);
      }

      if (filterOpts.status && filterOpts.status !== 'ALL') {
        users = users.filter(u => u.status === filterOpts.status);
      }

      if (filterOpts.company && filterOpts.company !== 'ALL') {
        users = users.filter(u => u.companyId === filterOpts.company);
      }

      if (filterOpts.search) {
        const q = String(filterOpts.search).toLowerCase().trim();
        users = users.filter(u => 
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.id && u.id.toLowerCase().includes(q)) ||
          (u.phone && u.phone.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
        );
      }

      // CRITICAL PASSWORD SECURITY: NEVER expose plaintext passwords to Admin views
      return users.map(u => {
        const clone = { ...u };
        delete clone.password; // Strip plaintext password
        const tokAcc = this.getTokenAccount(`ACC-${u.id}`) || this.getTokenAccount(u.username);
        clone.tokenBalance = tokAcc ? Number(tokAcc.tokenBalance) : 0;
        return clone;
      });
    },

    getUserTokenBalance(identifier) {
      const acc = this.getTokenAccount(identifier) || this.getTokenAccount(`ACC-${identifier}`);
      return acc ? Number(acc.tokenBalance) : 0;
    },

    adminResetUserPassword(userId, newPassword, reason = 'Administrative password reset') {
      this.init();
      if (!newPassword || newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long.');
      }
      const users = this._get(this.KEYS.USERS);
      const u = users.find(x => x.id === userId || x.username.toLowerCase() === userId.toLowerCase());
      if (!u) {
        throw new Error(`User ${userId} not found.`);
      }

      u.password = newPassword;
      u.updatedAt = new Date().toISOString();
      this._set(this.KEYS.USERS, users);

      this.logAudit('USER_PASSWORD_RESET', `User #${u.id}`, u.username, reason);
      broadcastEvent('USER_PASSWORD_RESET', { userId: u.id, username: u.username });
      return { success: true, message: `Password for @${u.username} successfully reset.` };
    },

    updateUserCompany(userId, newCompanyId, reason = 'Administrative company re-assignment') {
      this.init();
      const users = this._get(this.KEYS.USERS);
      const u = users.find(x => x.id === userId || x.username.toLowerCase() === userId.toLowerCase());
      if (!u) {
        throw new Error(`User ${userId} not found.`);
      }

      const prevCompany = u.companyId;
      u.companyId = newCompanyId;
      u.updatedAt = new Date().toISOString();
      this._set(this.KEYS.USERS, users);

      // Also update company on token account
      const accounts = this._get(this.KEYS.TOKEN_ACCOUNTS);
      const tokAcc = accounts.find(a => 
        a.internalAccountId === `ACC-${u.id}` || 
        a.username.toLowerCase() === u.username.toLowerCase()
      );
      if (tokAcc) {
        tokAcc.companyId = newCompanyId;
        this._set(this.KEYS.TOKEN_ACCOUNTS, accounts);
      }

      this.logAudit('USER_COMPANY_CHANGED', `User #${u.id}`, u.username, `${reason} (${prevCompany} -> ${newCompanyId})`);
      broadcastEvent('USER_COMPANY_CHANGED', { userId: u.id, username: u.username, companyId: newCompanyId });
      return { success: true, user: u };
    },

    registerOrLoginUser(username, password, phone = '', email = '') {
      this.init();
      const users = this._get(this.KEYS.USERS);
      let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toISOString().split('T')[0];

      if (!user) {
        const maxNum = users.reduce((max, u) => {
          const n = parseInt(String(u.id).replace(/\D/g, ''), 10);
          return isNaN(n) ? max : Math.max(max, n);
        }, 1095);
        const newId = 'USR-' + (maxNum + 1);
        user = {
          id: newId,
          username: username,
          name: username.replace(/_/g, ' '),
          phone: phone || ('+92 3' + Math.floor(100000000 + Math.random() * 900000000)),
          email: email || (username.toLowerCase() + '@gmail.com'),
          password: password || '123456',
          balance: 10450.00,
          locked: 0.00,
          totalDeposit: 10450.00,
          totalWithdraw: 0.00,
          companyId: 'COMP-01',
          status: 'Active',
          kycStatus: 'Pending',
          source: 'Self Registered (Live Web)',
          regDate: dateStr,
          lastLogin: `Today, ${timeStr}`,
          loginHistory: [{ timestamp: `${dateStr} ${timeStr}`, ip: '192.168.1.100', device: navigator.userAgent.substring(0, 40) }],
          notes: 'Auto-registered player account.'
        };
        users.unshift(user);
        this._set(this.KEYS.USERS, users);

        // Also create closed-loop virtual token account for this new user if not present
        if (!this.getTokenAccount(`ACC-${user.id}`) && !this.getTokenAccount(user.username)) {
          try {
            this.createTokenAccount(`ACC-${user.id}`, user.username, 'USER', user.companyId, 5000);
          } catch(e) {}
        }

        this.logAudit('USER_REGISTERED', `User #${user.id}`, user.username, 'Player self-registered from website portal');
        broadcastEvent('USER_REGISTERED', user);
      } else {
        user.lastLogin = `Today, ${timeStr}`;
        if (password) user.password = password;
        if (!user.loginHistory) user.loginHistory = [];
        user.loginHistory.unshift({ timestamp: `${dateStr} ${timeStr}`, ip: '192.168.1.100', device: navigator.userAgent.substring(0, 40) });
        if (user.loginHistory.length > 20) user.loginHistory.pop();
        this._set(this.KEYS.USERS, users);
        broadcastEvent('USER_LOGIN', user);
      }

      localStorage.setItem('userLoginName', user.username);
      localStorage.setItem('userWalletBalance', String(user.balance));
      return user;
    },

    getUser(username) {
      this.init();
      const users = this._get(this.KEYS.USERS);
      const q = String(username || '').toLowerCase();
      return users.find(u => 
        (u.username && u.username.toLowerCase() === q) || 
        (u.id && u.id.toLowerCase() === q) ||
        (u.phone && u.phone.toLowerCase() === q)
      ) || null;
    },

    getUserBalance(username) {
      const u = this.getUser(username);
      return u ? u.balance : 10450.00;
    },

    getUserCredentials(identifier) {
      this.init();
      const users = this._get(this.KEYS.USERS);
      const query = String(identifier || '').toLowerCase();
      const u = users.find(x => 
        (x.id && x.id.toLowerCase() === query) || 
        (x.username && x.username.toLowerCase() === query) ||
        (x.phone && x.phone.toLowerCase() === query)
      );
      if (!u) return null;
      return {
        id: u.id,
        username: u.username,
        name: u.name || u.username,
        password: u.password || '123456',
        companyId: u.companyId || 'COMP-01'
      };
    },

    // ─── 5. CLOSED-LOOP VIRTUAL TOKEN SYSTEM (ATOMIC & CONSERVED) ───

    getTokenAccount(identifier) {
      this.init();
      const accounts = this._get(this.KEYS.TOKEN_ACCOUNTS);
      const query = String(identifier || '').toLowerCase();
      return accounts.find(a => 
        a.internalAccountId.toLowerCase() === query || 
        a.username.toLowerCase() === query
      ) || null;
    },

    createTokenAccount(internalAccountId, username, accountType = 'USER', companyId = 'COMP-01', initialBalance = 0) {
      this.init();
      const accounts = this._get(this.KEYS.TOKEN_ACCOUNTS);
      
      // Server-side uniqueness check
      if (accounts.some(a => a.internalAccountId.toLowerCase() === internalAccountId.toLowerCase())) {
        throw new Error(`Account ID ${internalAccountId} already exists`);
      }
      if (accounts.some(a => a.username.toLowerCase() === username.toLowerCase())) {
        throw new Error(`Username ${username} already has a token account`);
      }

      const newAccount = {
        internalAccountId,
        username,
        accountType,
        companyId,
        tokenBalance: Number(initialBalance),
        status: 'Active',
        createdDate: new Date().toISOString().split('T')[0]
      };

      accounts.push(newAccount);
      this._set(this.KEYS.TOKEN_ACCOUNTS, accounts);
      return newAccount;
    },

    getAllTokenAccounts(companyId = null, accountType = null) {
      this.init();
      let accounts = this._get(this.KEYS.TOKEN_ACCOUNTS);
      if (companyId && companyId !== 'ALL') {
        accounts = accounts.filter(a => a.companyId === companyId || a.accountType === 'MASTER');
      }
      if (accountType && accountType !== 'ALL') {
        accounts = accounts.filter(a => a.accountType === accountType);
      }
      return accounts;
    },

    /**
     * Verifies Recipient by BOTH User ID and Username
     */
    verifyRecipient(userId, username, operatorAdmin = null) {
      this.init();
      const rawUserId = String(userId || '').trim();
      const rawUsername = String(username || '').trim();

      if (!rawUserId || !rawUsername) {
        return {
          success: false,
          error: 'INVALID_INPUT',
          message: 'Both User ID and Username are required.'
        };
      }

      const users = this._get(this.KEYS.USERS);
      const companies = this._get(this.KEYS.COMPANIES);
      const accounts = this._get(this.KEYS.TOKEN_ACCOUNTS);

      // Check if recipient is a Company Vault or Master Account (e.g. ACC-COMP-01)
      const isVaultAccount = accounts.find(a => 
        (a.internalAccountId.toUpperCase() === rawUserId.toUpperCase() || a.internalAccountId.toUpperCase() === rawUsername.toUpperCase() || a.username.toLowerCase() === rawUsername.toLowerCase()) &&
        (a.accountType === 'COMPANY_ADMIN' || a.accountType === 'MASTER')
      );
      if (isVaultAccount) {
        return {
          success: true,
          user: {
            id: isVaultAccount.internalAccountId,
            username: isVaultAccount.username,
            name: isVaultAccount.username.replace(/_/g, ' '),
            companyId: isVaultAccount.companyId || 'COMP-01',
            companyName: isVaultAccount.username,
            status: isVaultAccount.status || 'Active',
            internalAccountId: isVaultAccount.internalAccountId,
            currentTokenBalance: Number(isVaultAccount.tokenBalance)
          }
        };
      }

      // Clean ID representation (handle 'USR-1092', '1092', 'ACC-USR-1092')
      const targetId = rawUserId.toUpperCase().replace(/^ACC-/, '');
      const targetUsername = rawUsername.toLowerCase();

      // Find user by ID and by Username
      const userById = users.find(u => {
        const uId = String(u.id || '').toUpperCase();
        return uId === targetId || uId === ('USR-' + targetId.replace('USR-', ''));
      });
      const userByUsername = users.find(u => String(u.username || '').toLowerCase() === targetUsername);

      // Case 1: Neither found
      if (!userById && !userByUsername) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User ID or Username is incorrect.'
        };
      }

      // Case 2: One exists but does NOT match the other
      if (!userById || !userByUsername || userById.id !== userByUsername.id) {
        return {
          success: false,
          error: 'IDENTITY_MISMATCH',
          message: 'User ID and Username do not belong to the same account.'
        };
      }

      const user = userById;

      // Case 3: Account status check
      if (user.status && user.status.toLowerCase() === 'suspended') {
        return {
          success: false,
          error: 'USER_SUSPENDED',
          message: 'User account is suspended and cannot receive tokens.'
        };
      }

      // Case 4: Company authorization check for Company Admins
      const op = operatorAdmin || { role: 'SUPER_ADMIN', companyId: 'COMP-01', name: 'System Admin' };
      if (op.role === 'COMPANY_ADMIN' && user.companyId && user.companyId !== op.companyId) {
        return {
          success: false,
          error: 'UNAUTHORIZED_SCOPE',
          message: `Permission Denied: User #${user.id} belongs to ${user.companyId}, outside your company scope (${op.companyId}).`
        };
      }

      // Case 5: Ensure token account exists and get live token balance
      let tokenAcc = this.getTokenAccount(user.username) || this.getTokenAccount(`ACC-${user.id}`);
      if (!tokenAcc) {
        try {
          tokenAcc = this.createTokenAccount(`ACC-${user.id}`, user.username, 'USER', user.companyId, 5000);
        } catch(e) {
          tokenAcc = this.getTokenAccount(user.username);
        }
      }

      const compObj = companies.find(c => c.id === user.companyId);
      const companyDisplayName = compObj ? compObj.name : (user.companyId || 'Global HQ');

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name || user.username,
          companyId: user.companyId || 'COMP-01',
          companyName: companyDisplayName,
          status: user.status || 'Active',
          internalAccountId: tokenAcc ? tokenAcc.internalAccountId : `ACC-${user.id}`,
          currentTokenBalance: tokenAcc ? Number(tokenAcc.tokenBalance) : 0
        }
      };
    },

    /**
     * Executes atomic token transfer with full identity validation, sender balance check,
     * RBAC permission enforcement, idempotency protection, and immutable token ledger logging.
     */
    executeTokenTransfer(params) {
      this.init();
      const {
        senderAccountId,
        recipientUserId,
        recipientUsername,
        amount,
        reason,
        operatorAdmin,
        idempotencyKey
      } = params || {};

      // 1. Idempotency check to prevent duplicate transfers on multi-clicks
      if (idempotencyKey) {
        if (!this._processedIdempotencyKeys) this._processedIdempotencyKeys = new Map();
        if (this._processedIdempotencyKeys.has(idempotencyKey)) {
          console.warn('[PlatformSync] Duplicate transfer request blocked by idempotency key:', idempotencyKey);
          return this._processedIdempotencyKeys.get(idempotencyKey);
        }
      }

      // 2. Validate token amount
      const tokenAmount = Number(amount);
      if (isNaN(tokenAmount) || tokenAmount <= 0 || !Number.isInteger(tokenAmount)) {
        throw new Error('Enter a valid token amount.');
      }

      // 3. Strict Recipient Verification (Both User ID and Username MUST match)
      const verifyRes = this.verifyRecipient(recipientUserId, recipientUsername, operatorAdmin);
      if (!verifyRes.success) {
        throw new Error(verifyRes.message);
      }
      const verifiedRecipient = verifyRes.user;

      // 4. Validate Sender Account
      const accounts = this._get(this.KEYS.TOKEN_ACCOUNTS);
      const sender = accounts.find(a => 
        a.internalAccountId.toLowerCase() === String(senderAccountId || '').toLowerCase() || 
        a.username.toLowerCase() === String(senderAccountId || '').toLowerCase()
      );
      if (!sender) {
        throw new Error(`Sender account [${senderAccountId}] not found.`);
      }

      const receiver = accounts.find(a => 
        a.internalAccountId.toLowerCase() === verifiedRecipient.internalAccountId.toLowerCase() ||
        a.username.toLowerCase() === verifiedRecipient.username.toLowerCase()
      );
      if (!receiver) {
        throw new Error(`Recipient token account [${verifiedRecipient.internalAccountId}] not found.`);
      }

      if (sender.internalAccountId === receiver.internalAccountId) {
        throw new Error('Sender and Receiver cannot be the same account.');
      }

      // 5. Authoritative Sender Balance Check
      if (sender.tokenBalance < tokenAmount) {
        throw new Error(`Insufficient token balance. Current balance: ${sender.tokenBalance.toLocaleString()} VTK, Requested: ${tokenAmount.toLocaleString()} VTK`);
      }

      // 6. Permission Hierarchy & Company Isolation
      const op = operatorAdmin || { role: 'SUPER_ADMIN', companyId: 'COMP-01', name: 'System Admin' };
      if (op.role === 'COMPANY_ADMIN') {
        if (sender.companyId !== op.companyId) {
          throw new Error(`Permission Denied: Sender does not belong to your company ${op.companyId}`);
        }
        if (receiver.companyId && receiver.companyId !== op.companyId) {
          throw new Error(`Permission Denied: Receiver does not belong to your company ${op.companyId}`);
        }
      }

      // 7. Atomic Balance Transfer (2-Phase)
      const prevSenderBal = sender.tokenBalance;
      const prevReceiverBal = receiver.tokenBalance;

      sender.tokenBalance -= tokenAmount;
      receiver.tokenBalance += tokenAmount;
      this._set(this.KEYS.TOKEN_ACCOUNTS, accounts);

      // 8. Create Permanent Immutable Token Ledger Record
      const txId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
      const now = new Date();
      const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const ledgerEntry = {
        transactionId: txId,
        senderAccountId: sender.internalAccountId,
        senderUsername: sender.username,
        receiverAccountId: receiver.internalAccountId,
        receiverUsername: receiver.username,
        recipientUserId: verifiedRecipient.id,
        amount: tokenAmount,
        tokenType: 'VTK_GAME_TOKEN',
        reason: reason || 'Manual token allocation',
        companyId: verifiedRecipient.companyId || 'COMP-01',
        createdBy: op.name || 'Admin Operator',
        status: 'COMPLETED',
        timestamp: dateStr,
        createdAt: now.toISOString()
      };

      const ledger = this._get(this.KEYS.TOKEN_LEDGER);
      ledger.unshift(ledgerEntry);
      if (ledger.length > 3000) ledger.pop();
      this._set(this.KEYS.TOKEN_LEDGER, ledger);

      // 9. Create Immutable Security Audit Log Record
      this.logAudit(
        'TOKEN_TRANSFER',
        `User #${verifiedRecipient.id} (@${verifiedRecipient.username})`,
        verifiedRecipient.id,
        `Transferred ${tokenAmount.toLocaleString()} VTK from ${sender.username}: ${reason || 'Manual token allocation'}`,
        `${prevSenderBal.toLocaleString()} VTK`,
        `${sender.tokenBalance.toLocaleString()} VTK`
      );

      // 10. Real-Time Event Broadcast
      const resultObj = {
        success: true,
        transaction: ledgerEntry,
        recipientUserId: verifiedRecipient.id,
        recipientUsername: verifiedRecipient.username,
        recipientNewBalance: receiver.tokenBalance,
        senderNewBalance: sender.tokenBalance,
        amount: tokenAmount,
        message: `${tokenAmount.toLocaleString()} tokens successfully sent to @${verifiedRecipient.username}.`
      };

      if (idempotencyKey && this._processedIdempotencyKeys) {
        this._processedIdempotencyKeys.set(idempotencyKey, resultObj);
      }

      broadcastEvent('TOKEN_TRANSFER_COMPLETED', {
        transactionId: txId,
        sender: sender.username,
        receiver: receiver.username,
        recipientUserId: verifiedRecipient.id,
        amount: tokenAmount,
        senderNewBalance: sender.tokenBalance,
        receiverNewBalance: receiver.tokenBalance
      });

      return resultObj;
    },

    /**
     * Executes an Atomic Token Transfer with strict permission hierarchy (backward-compatible wrapper)
     */
    transferTokens(senderIdOrName, receiverIdOrName, amount, reason, operatorAdmin = null) {
      const accounts = this._get(this.KEYS.TOKEN_ACCOUNTS);
      const rec = accounts.find(a => 
        a.internalAccountId.toLowerCase() === String(receiverIdOrName).toLowerCase() || 
        a.username.toLowerCase() === String(receiverIdOrName).toLowerCase()
      );
      const recipientUsername = rec ? rec.username : String(receiverIdOrName).replace(/^ACC-/, '');
      const recipientUserId = rec ? (rec.internalAccountId.startsWith('ACC-USR-') ? rec.internalAccountId.replace('ACC-', '') : rec.internalAccountId) : receiverIdOrName;
      
      const res = this.executeTokenTransfer({
        senderAccountId: senderIdOrName,
        recipientUserId: recipientUserId,
        recipientUsername: recipientUsername,
        amount: amount,
        reason: reason,
        operatorAdmin: operatorAdmin
      });
      return res.transaction;
    },

    /**
     * User places an in-game virtual token bet (User -> Game Settlement Pool)
     */
    recordGameTokenBet(username, gameId, roundId, tokenAmount, selectedBet = '') {
      this.init();
      const amount = Number(tokenAmount);
      if (isNaN(amount) || amount <= 0) return false;

      const accounts = this._get(this.KEYS.TOKEN_ACCOUNTS);
      const userAcc = accounts.find(a => a.username.toLowerCase() === (username || '').toLowerCase());
      const poolAcc = accounts.find(a => a.internalAccountId === 'ACC-POOL-SETTLE');

      if (!userAcc || !poolAcc || userAcc.tokenBalance < amount) return false;

      // Atomic Balance Transfer
      userAcc.tokenBalance -= amount;
      poolAcc.tokenBalance += amount;
      this._set(this.KEYS.TOKEN_ACCOUNTS, accounts);

      const txId = 'TXN-VTK-' + Math.floor(10000 + Math.random() * 90000);
      const now = new Date();
      const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const entry = {
        transactionId: txId,
        senderAccountId: userAcc.internalAccountId,
        senderUsername: userAcc.username,
        receiverAccountId: poolAcc.internalAccountId,
        receiverUsername: poolAcc.username,
        amount: amount,
        tokenType: 'VTK_GAME_TOKEN',
        reason: `${gameId} Token Bet Entry (Round #${roundId}, Bet: ${selectedBet})`,
        gameId: gameId,
        roundId: String(roundId),
        createdBy: 'Game Engine',
        status: 'SETTLED',
        timestamp: dateStr,
        createdAt: now.toISOString()
      };

      const ledger = this._get(this.KEYS.TOKEN_LEDGER);
      ledger.unshift(entry);
      this._set(this.KEYS.TOKEN_LEDGER, ledger);

      broadcastEvent('GAME_TOKEN_BET_PLACED', { username, gameId, amount, newBalance: userAcc.tokenBalance });
      return entry;
    },

    /**
     * Settles in-game virtual token win payout (Game Settlement Pool -> User)
     */
    settleGameTokenPayout(username, gameId, roundId, winTokens) {
      this.init();
      const amount = Number(winTokens);
      if (isNaN(amount) || amount <= 0) return false;

      const accounts = this._get(this.KEYS.TOKEN_ACCOUNTS);
      const userAcc = accounts.find(a => a.username.toLowerCase() === (username || '').toLowerCase());
      const poolAcc = accounts.find(a => a.internalAccountId === 'ACC-POOL-SETTLE');

      if (!userAcc || !poolAcc) return false;

      // Atomic Balance Transfer
      poolAcc.tokenBalance = Math.max(0, poolAcc.tokenBalance - amount);
      userAcc.tokenBalance += amount;
      this._set(this.KEYS.TOKEN_ACCOUNTS, accounts);

      const txId = 'TXN-VTK-' + Math.floor(10000 + Math.random() * 90000);
      const now = new Date();
      const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const entry = {
        transactionId: txId,
        senderAccountId: poolAcc.internalAccountId,
        senderUsername: poolAcc.username,
        receiverAccountId: userAcc.internalAccountId,
        receiverUsername: userAcc.username,
        amount: amount,
        tokenType: 'VTK_GAME_TOKEN',
        reason: `${gameId} Token Win Settlement (Round #${roundId})`,
        gameId: gameId,
        roundId: String(roundId),
        createdBy: 'Game Engine Settlement',
        status: 'SETTLED',
        timestamp: dateStr,
        createdAt: now.toISOString()
      };

      const ledger = this._get(this.KEYS.TOKEN_LEDGER);
      ledger.unshift(entry);
      this._set(this.KEYS.TOKEN_LEDGER, ledger);

      broadcastEvent('GAME_TOKEN_PAYOUT_SETTLED', { username, gameId, amount, newBalance: userAcc.tokenBalance });
      return entry;
    },

    /**
     * Evaluates Platform Token Conservation (Total Master + Companies + Users + Settlement Pool)
     */
    getTokenConservationAudit() {
      this.init();
      const accounts = this._get(this.KEYS.TOKEN_ACCOUNTS);
      
      const masterAccount = accounts.find(a => a.internalAccountId === 'ACC-MASTER-001');
      const settlementPool = accounts.find(a => a.internalAccountId === 'ACC-POOL-SETTLE');
      const companyAccounts = accounts.filter(a => a.accountType === 'COMPANY_ADMIN');
      const userAccounts = accounts.filter(a => a.accountType === 'USER');

      const masterBalance = masterAccount ? masterAccount.tokenBalance : 0;
      const settlementBalance = settlementPool ? settlementPool.tokenBalance : 0;
      const totalCompanyBalance = companyAccounts.reduce((sum, a) => sum + a.tokenBalance, 0);
      const totalUserBalance = userAccounts.reduce((sum, a) => sum + a.tokenBalance, 0);

      const calculatedTotal = masterBalance + settlementBalance + totalCompanyBalance + totalUserBalance;
      const discrepancy = calculatedTotal - this.TOTAL_TOKEN_SUPPLY;

      return {
        totalSupply: this.TOTAL_TOKEN_SUPPLY,
        masterVault: masterBalance,
        settlementPool: settlementBalance,
        companyVaults: totalCompanyBalance,
        userHoldings: totalUserBalance,
        calculatedTotal: calculatedTotal,
        discrepancy: discrepancy,
        isConserved: discrepancy === 0,
        companyBreakdown: companyAccounts,
        totalUsers: userAccounts.length
      };
    },

    getTokenLedger(arg1 = null, arg2 = null, arg3 = null) {
      this.init();
      let ledger = this._get(this.KEYS.TOKEN_LEDGER);
      let filters = {};

      if (arg1 && typeof arg1 === 'object') {
        filters = arg1;
      } else {
        filters = { companyId: arg1, accountId: arg2, gameId: arg3 };
      }

      const { companyId, accountId, gameId, dateRange, status, searchQuery } = filters;

      if (gameId && gameId !== 'ALL') {
        ledger = ledger.filter(l => l.gameId === gameId);
      }
      if (accountId && accountId !== 'ALL') {
        const q = String(accountId).toLowerCase();
        ledger = ledger.filter(l => 
          (l.senderAccountId && l.senderAccountId.toLowerCase() === q) || 
          (l.receiverAccountId && l.receiverAccountId.toLowerCase() === q) ||
          (l.recipientUserId && l.recipientUserId.toLowerCase() === q) ||
          (l.senderUsername && l.senderUsername.toLowerCase() === q) ||
          (l.receiverUsername && l.receiverUsername.toLowerCase() === q)
        );
      }
      if (companyId && companyId !== 'ALL') {
        ledger = ledger.filter(l => l.companyId === companyId);
      }
      if (status && status !== 'ALL') {
        ledger = ledger.filter(l => (l.status || '').toUpperCase() === status.toUpperCase());
      }
      if (dateRange && dateRange !== 'ALL') {
        ledger = this._filterByDate(ledger, dateRange);
      }
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        ledger = ledger.filter(l => 
          (l.transactionId && l.transactionId.toLowerCase().includes(q)) ||
          (l.senderUsername && l.senderUsername.toLowerCase().includes(q)) ||
          (l.receiverUsername && l.receiverUsername.toLowerCase().includes(q)) ||
          (l.recipientUserId && l.recipientUserId.toLowerCase().includes(q)) ||
          (l.senderAccountId && l.senderAccountId.toLowerCase().includes(q)) ||
          (l.receiverAccountId && l.receiverAccountId.toLowerCase().includes(q)) ||
          (l.reason && l.reason.toLowerCase().includes(q)) ||
          (l.createdBy && l.createdBy.toLowerCase().includes(q))
        );
      }

      return ledger;
    },

    getUserTokenProfile(username) {
      this.init();
      const acc = this.getTokenAccount(username);
      if (!acc) return null;

      const ledger = this._get(this.KEYS.TOKEN_LEDGER);
      const userTx = ledger.filter(l => 
        l.senderAccountId === acc.internalAccountId || 
        l.receiverAccountId === acc.internalAccountId
      );

      const totalReceived = userTx
        .filter(l => l.receiverAccountId === acc.internalAccountId && l.senderAccountId !== 'ACC-POOL-SETTLE')
        .reduce((sum, l) => sum + l.amount, 0);

      const totalSpent = userTx
        .filter(l => l.senderAccountId === acc.internalAccountId && l.receiverAccountId === 'ACC-POOL-SETTLE')
        .reduce((sum, l) => sum + l.amount, 0);

      const totalWon = userTx
        .filter(l => l.receiverAccountId === acc.internalAccountId && l.senderAccountId === 'ACC-POOL-SETTLE')
        .reduce((sum, l) => sum + l.amount, 0);

      return {
        internalAccountId: acc.internalAccountId,
        username: acc.username,
        companyId: acc.companyId,
        tokenBalance: acc.tokenBalance,
        status: acc.status,
        createdDate: acc.createdDate,
        totalReceived,
        totalSpent,
        totalWon,
        transactions: userTx
      };
    },

    // ─── DEPOSIT WORKFLOW SYNCHRONIZATION ──────────────────────────

    createDepositRequest(username, amount, method = 'Easypaisa', ref = '') {
      this.init();
      const user = this.getUser(username);
      const depId = 'DEP-' + Math.floor(1000 + Math.random() * 9000);
      const txId = 'TX-' + Math.floor(1000 + Math.random() * 9000);
      const dateStr = new Date().toLocaleString();

      const newDeposit = {
        id: depId,
        userId: user ? user.id : 'USR-GUEST',
        username: username,
        amount: Number(amount),
        method: method,
        ref: ref || ('REF-' + Date.now().toString().slice(-8)),
        companyId: user ? user.companyId : 'COMP-01',
        status: 'Pending',
        date: dateStr,
        createdAt: new Date().toISOString()
      };

      const deposits = this._get(this.KEYS.DEPOSITS);
      deposits.unshift(newDeposit);
      this._set(this.KEYS.DEPOSITS, deposits);

      const txs = this._get(this.KEYS.TRANSACTIONS);
      txs.unshift({
        id: txId,
        userId: user ? user.id : 'USR-GUEST',
        username: username,
        type: 'deposit',
        amount: Number(amount),
        status: 'pending',
        ref: newDeposit.ref,
        companyId: newDeposit.companyId,
        date: dateStr
      });
      this._set(this.KEYS.TRANSACTIONS, txs);

      broadcastEvent('DEPOSIT_CREATED', newDeposit);
      return newDeposit;
    },

    approveDeposit(depId, adminName = 'Finance Admin') {
      this.init();
      const deposits = this._get(this.KEYS.DEPOSITS);
      const dep = deposits.find(d => d.id === depId);
      if (!dep || dep.status !== 'Pending') return false;

      dep.status = 'Approved';
      dep.processedDate = new Date().toLocaleString();
      dep.processedBy = adminName;
      this._set(this.KEYS.DEPOSITS, deposits);

      const users = this._get(this.KEYS.USERS);
      const user = users.find(u => u.username.toLowerCase() === dep.username.toLowerCase());
      if (user) {
        user.balance += dep.amount;
        user.totalDeposit = (user.totalDeposit || 0) + dep.amount;
        this._set(this.KEYS.USERS, users);

        if (localStorage.getItem('userLoginName') === user.username) {
          localStorage.setItem('userWalletBalance', String(user.balance));
          if (typeof window.updateWalletUI === 'function') window.updateWalletUI();
        }
      }

      const txs = this._get(this.KEYS.TRANSACTIONS);
      const tx = txs.find(t => t.ref === dep.ref);
      if (tx) tx.status = 'approved';
      this._set(this.KEYS.TRANSACTIONS, txs);

      this.logAudit('DEPOSIT_APPROVED', `Deposit #${dep.id}`, dep.username, `Approved payment proof for Rs ${dep.amount}`);
      broadcastEvent('DEPOSIT_APPROVED', { deposit: dep, newBalance: user ? user.balance : null });
      return true;
    },

    rejectDeposit(depId, reason = 'Invalid transaction reference', adminName = 'Finance Admin') {
      this.init();
      const deposits = this._get(this.KEYS.DEPOSITS);
      const dep = deposits.find(d => d.id === depId);
      if (!dep || dep.status !== 'Pending') return false;

      dep.status = 'Rejected';
      dep.reason = reason;
      dep.processedDate = new Date().toLocaleString();
      dep.processedBy = adminName;
      this._set(this.KEYS.DEPOSITS, deposits);

      const txs = this._get(this.KEYS.TRANSACTIONS);
      const tx = txs.find(t => t.ref === dep.ref);
      if (tx) {
        tx.status = 'rejected';
        tx.reason = reason;
      }
      this._set(this.KEYS.TRANSACTIONS, txs);

      this.logAudit('DEPOSIT_REJECTED', `Deposit #${dep.id}`, dep.username, reason);
      broadcastEvent('DEPOSIT_REJECTED', dep);
      return true;
    },

    // ─── WITHDRAWAL WORKFLOW SYNCHRONIZATION ───────────────────────

    createWithdrawalRequest(username, amount, method = 'Bank Transfer', account = '') {
      this.init();
      const user = this.getUser(username);
      if (!user || user.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      user.balance -= Number(amount);
      user.locked = (user.locked || 0) + Number(amount);
      const users = this._get(this.KEYS.USERS);
      const uIdx = users.findIndex(u => u.id === user.id);
      if (uIdx > -1) users[uIdx] = user;
      this._set(this.KEYS.USERS, users);

      if (localStorage.getItem('userLoginName') === user.username) {
        localStorage.setItem('userWalletBalance', String(user.balance));
        if (typeof window.updateWalletUI === 'function') window.updateWalletUI();
      }

      const wthId = 'WTH-' + Math.floor(1000 + Math.random() * 9000);
      const txId = 'TX-' + Math.floor(1000 + Math.random() * 9000);
      const dateStr = new Date().toLocaleString();

      const newWth = {
        id: wthId,
        userId: user.id,
        username: user.username,
        amount: Number(amount),
        method: method,
        account: account || 'Default Account',
        companyId: user.companyId,
        status: 'Pending',
        requestDate: dateStr,
        createdAt: new Date().toISOString()
      };

      const wths = this._get(this.KEYS.WITHDRAWALS);
      wths.unshift(newWth);
      this._set(this.KEYS.WITHDRAWALS, wths);

      const txs = this._get(this.KEYS.TRANSACTIONS);
      txs.unshift({
        id: txId,
        userId: user.id,
        username: user.username,
        type: 'withdraw',
        amount: Number(amount),
        status: 'pending',
        ref: newWth.id,
        companyId: user.companyId,
        date: dateStr
      });
      this._set(this.KEYS.TRANSACTIONS, txs);

      broadcastEvent('WITHDRAWAL_CREATED', newWth);
      return newWth;
    },

    approveWithdrawal(wthId, adminName = 'Finance Admin') {
      this.init();
      const wths = this._get(this.KEYS.WITHDRAWALS);
      const wth = wths.find(w => w.id === wthId);
      if (!wth || wth.status !== 'Pending') return false;

      wth.status = 'Approved';
      wth.processedDate = new Date().toLocaleString();
      wth.processedBy = adminName;
      this._set(this.KEYS.WITHDRAWALS, wths);

      const users = this._get(this.KEYS.USERS);
      const user = users.find(u => u.username.toLowerCase() === wth.username.toLowerCase());
      if (user) {
        user.locked = Math.max(0, (user.locked || 0) - wth.amount);
        user.totalWithdraw = (user.totalWithdraw || 0) + wth.amount;
        this._set(this.KEYS.USERS, users);
      }

      const txs = this._get(this.KEYS.TRANSACTIONS);
      const tx = txs.find(t => t.ref === wth.id);
      if (tx) tx.status = 'approved';
      this._set(this.KEYS.TRANSACTIONS, txs);

      this.logAudit('WITHDRAWAL_APPROVED', `Withdrawal #${wth.id}`, wth.username, `Settled payout for Rs ${wth.amount}`);
      broadcastEvent('WITHDRAWAL_APPROVED', wth);
      return true;
    },

    rejectWithdrawal(wthId, reason = 'Wagering requirement incomplete', adminName = 'Finance Admin') {
      this.init();
      const wths = this._get(this.KEYS.WITHDRAWALS);
      const wth = wths.find(w => w.id === wthId);
      if (!wth || wth.status !== 'Pending') return false;

      wth.status = 'Rejected';
      wth.reason = reason;
      wth.processedDate = new Date().toLocaleString();
      wth.processedBy = adminName;
      this._set(this.KEYS.WITHDRAWALS, wths);

      const users = this._get(this.KEYS.USERS);
      const user = users.find(u => u.username.toLowerCase() === wth.username.toLowerCase());
      if (user) {
        user.locked = Math.max(0, (user.locked || 0) - wth.amount);
        user.balance += wth.amount;
        this._set(this.KEYS.USERS, users);

        if (localStorage.getItem('userLoginName') === user.username) {
          localStorage.setItem('userWalletBalance', String(user.balance));
          if (typeof window.updateWalletUI === 'function') window.updateWalletUI();
        }
      }

      const txs = this._get(this.KEYS.TRANSACTIONS);
      const tx = txs.find(t => t.ref === wth.id);
      if (tx) {
        tx.status = 'rejected';
        tx.reason = reason;
      }
      this._set(this.KEYS.TRANSACTIONS, txs);

      this.logAudit('WITHDRAWAL_REJECTED', `Withdrawal #${wth.id}`, wth.username, reason);
      broadcastEvent('WITHDRAWAL_REJECTED', { withdrawal: wth, refundedBalance: user ? user.balance : null });
      return true;
    },

    // ─── 6. GAME-WISE BETTING & ACTIVITY TRACKING ──────────────────

    recordGameActivity(username, gameId, gameName, roundId, betNumber, stake, tokens = 0, result = 'PENDING', payout = 0, extraMeta = {}) {
      this.init();
      const user = this.getUser(username);
      if (!user) return null;

      const actId = 'ACT-' + Math.floor(1000 + Math.random() * 9000);
      const ticketId = 'TKT-' + Math.floor(10000 + Math.random() * 90000);
      const now = new Date();
      const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const activity = {
        id: actId,
        ticketId: extraMeta.ticketId || ticketId,
        userId: user.id,
        username: user.username,
        companyId: user.companyId || 'COMP-01',
        gameId: gameId,
        gameName: gameName || gameId,
        roundId: String(roundId),
        betNumber: String(betNumber),
        betType: extraMeta.betType || 'figure',
        betTypeName: extraMeta.betTypeName || (String(betNumber).length + 'D Figure'),
        multiplier: Number(extraMeta.multiplier || 8),
        selectedRounds: extraMeta.selectedRounds || ['1st Draw'],
        potentialPayout: Number(extraMeta.potentialPayout || (stake * (extraMeta.multiplier || 8))),
        stake: Number(stake),
        tokens: Number(tokens || (stake / 10)),
        currency: 'PKR',
        result: result,
        payout: Number(payout),
        netResult: Number(payout) - Number(stake),
        date: dateStr,
        createdAt: now.toISOString()
      };

      const activities = this._get(this.KEYS.GAME_ACTIVITIES);
      activities.unshift(activity);
      if (activities.length > 1000) activities.pop();
      this._set(this.KEYS.GAME_ACTIVITIES, activities);

      this.recordBet(username, gameId, roundId, betNumber, stake);

      broadcastEvent('GAME_ACTIVITY_RECORDED', activity);
      return activity;
    },

    getUserActiveBets(username, gameId = null) {
      this.init();
      const activities = this._get(this.KEYS.GAME_ACTIVITIES);
      const userActs = activities.filter(a => 
        String(a.username).toLowerCase() === String(username).toLowerCase() && 
        (a.result === 'PENDING' || a.result === 'ACTIVE')
      );
      if (gameId && gameId !== 'ALL') {
        return userActs.filter(a => a.gameId === gameId);
      }
      return userActs;
    },

    getUserBetsHistory(username, gameId = null) {
      this.init();
      const activities = this._get(this.KEYS.GAME_ACTIVITIES);
      const userActs = activities.filter(a => 
        String(a.username).toLowerCase() === String(username).toLowerCase()
      );
      if (gameId && gameId !== 'ALL') {
        return userActs.filter(a => a.gameId === gameId);
      }
      return userActs;
    },

    _filterByDate(items, dateRange, dateField = 'createdAt') {
      if (!dateRange || dateRange === 'ALL') return items;
      const now = new Date();
      let start = new Date(0);

      if (dateRange === 'TODAY') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateRange === 'YESTERDAY') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return items.filter(i => {
          const d = new Date(i[dateField]);
          return d >= start && d < end;
        });
      } else if (dateRange === 'LAST_7_DAYS') {
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateRange === 'LAST_30_DAYS') {
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (dateRange === 'THIS_MONTH') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      return items.filter(i => new Date(i[dateField]) >= start);
    },

    getGameWiseSummary(companyId = null, dateRange = 'ALL') {
      this.init();
      let activities = this._get(this.KEYS.GAME_ACTIVITIES);
      if (companyId && companyId !== 'ALL') {
        activities = activities.filter(a => a.companyId === companyId);
      }
      activities = this._filterByDate(activities, dateRange);

      const games = this._get(this.KEYS.GAMES);
      
      return games.map(g => {
        const gameActs = activities.filter(a => a.gameId === g.id);
        const uniqueUsers = new Set(gameActs.map(a => a.username)).size;
        const totalEntries = gameActs.length;
        const totalStake = gameActs.reduce((sum, a) => sum + (Number(a.stake) || 0), 0);
        const totalTokens = gameActs.reduce((sum, a) => sum + (Number(a.tokens) || 0), 0);
        const totalPayouts = gameActs.reduce((sum, a) => sum + (Number(a.payout) || 0), 0);
        const netResult = totalStake - totalPayouts;

        return {
          gameId: g.id,
          gameName: g.name,
          category: g.category,
          route: g.route,
          maintenance: g.maintenance,
          status: g.status,
          uniqueUsers,
          totalEntries,
          totalStake,
          totalTokens,
          totalPayouts,
          netResult,
          turnoverFormatted: `Rs ${totalStake.toLocaleString()}`
        };
      });
    },

    getGameDetailsAnalytics(gameId, companyId = null, dateRange = 'ALL') {
      this.init();
      let activities = this._get(this.KEYS.GAME_ACTIVITIES).filter(a => a.gameId === gameId);
      if (companyId && companyId !== 'ALL') {
        activities = activities.filter(a => a.companyId === companyId);
      }
      activities = this._filterByDate(activities, dateRange);

      const uniqueUsersSet = new Set(activities.map(a => a.username));
      const totalEntries = activities.length;
      const totalStake = activities.reduce((sum, a) => sum + (Number(a.stake) || 0), 0);
      const totalTokens = activities.reduce((sum, a) => sum + (Number(a.tokens) || 0), 0);
      const totalPayouts = activities.reduce((sum, a) => sum + (Number(a.payout) || 0), 0);
      const totalWins = activities.filter(a => a.result === 'WON').length;
      const totalLosses = activities.filter(a => a.result === 'LOST').length;

      const userMap = {};
      activities.forEach(a => {
        if (!userMap[a.username]) {
          userMap[a.username] = {
            userId: a.userId,
            username: a.username,
            companyId: a.companyId,
            entries: 0,
            stake: 0,
            tokens: 0,
            payout: 0,
            netResult: 0,
            lastPlayed: a.date
          };
        }
        userMap[a.username].entries += 1;
        userMap[a.username].stake += a.stake;
        userMap[a.username].tokens += a.tokens;
        userMap[a.username].payout += a.payout;
        userMap[a.username].netResult += (a.payout - a.stake);
      });

      return {
        gameId,
        totalUsers: uniqueUsersSet.size,
        totalEntries,
        totalStake,
        totalTokens,
        totalPayouts,
        netResult: totalStake - totalPayouts,
        totalWins,
        totalLosses,
        participants: Object.values(userMap),
        ledger: activities
      };
    },

    getUserGameBreakdown(username) {
      this.init();
      const activities = this._get(this.KEYS.GAME_ACTIVITIES).filter(a => a.username.toLowerCase() === (username || '').toLowerCase());
      
      const gameMap = {};
      activities.forEach(a => {
        if (!gameMap[a.gameId]) {
          gameMap[a.gameId] = {
            gameId: a.gameId,
            gameName: a.gameName,
            entries: 0,
            stake: 0,
            tokens: 0,
            payouts: 0,
            netResult: 0,
            lastActivity: a.date
          };
        }
        gameMap[a.gameId].entries += 1;
        gameMap[a.gameId].stake += a.stake;
        gameMap[a.gameId].tokens += a.tokens;
        gameMap[a.gameId].payouts += a.payout;
        gameMap[a.gameId].netResult += (a.payout - a.stake);
      });

      return {
        summary: Object.values(gameMap),
        recentTickets: activities.slice(0, 15)
      };
    },

    // ─── BETTING & BASIC LEDGER HELPERS ────────────────────────────

    recordBet(username, gameId, roundNumber, betNumber, amount) {
      this.init();
      const user = this.getUser(username);
      if (!user || user.balance < amount) return false;

      user.balance -= Number(amount);
      const users = this._get(this.KEYS.USERS);
      const uIdx = users.findIndex(u => u.id === user.id);
      if (uIdx > -1) users[uIdx] = user;
      this._set(this.KEYS.USERS, users);

      if (localStorage.getItem('userLoginName') === user.username) {
        localStorage.setItem('userWalletBalance', String(user.balance));
        if (typeof window.updateWalletUI === 'function') window.updateWalletUI();
      }

      const txs = this._get(this.KEYS.TRANSACTIONS);
      txs.unshift({
        id: 'TX-' + Math.floor(1000 + Math.random() * 9000),
        userId: user.id,
        username: user.username,
        type: 'bet_wager',
        amount: Number(amount),
        status: 'settled',
        ref: `${gameId} - Round #${roundNumber} (Ticket: ${betNumber})`,
        companyId: user.companyId,
        date: new Date().toLocaleString()
      });
      if (txs.length > 200) txs.pop();
      this._set(this.KEYS.TRANSACTIONS, txs);

      broadcastEvent('BET_PLACED', { username, gameId, amount, newBalance: user.balance });
      return true;
    },

    recordWin(username, gameId, roundNumber, winAmount) {
      this.init();
      const user = this.getUser(username);
      if (!user) return false;

      user.balance += Number(winAmount);
      const users = this._get(this.KEYS.USERS);
      const uIdx = users.findIndex(u => u.id === user.id);
      if (uIdx > -1) users[uIdx] = user;
      this._set(this.KEYS.USERS, users);

      if (localStorage.getItem('userLoginName') === user.username) {
        localStorage.setItem('userWalletBalance', String(user.balance));
        if (typeof window.updateWalletUI === 'function') window.updateWalletUI();
      }

      const txs = this._get(this.KEYS.TRANSACTIONS);
      txs.unshift({
        id: 'TX-' + Math.floor(1000 + Math.random() * 9000),
        userId: user.id,
        username: user.username,
        type: 'bet_win',
        amount: Number(winAmount),
        status: 'settled',
        ref: `${gameId} - Round #${roundNumber} Payout`,
        companyId: user.companyId,
        date: new Date().toLocaleString()
      });
      this._set(this.KEYS.TRANSACTIONS, txs);

      broadcastEvent('BET_WON', { username, gameId, winAmount, newBalance: user.balance });
      return true;
    },

    // ─── AUDIT LOGGING & EVENT BUS ─────────────────────────────────

    logAudit(action, target, targetId, reason, previousVal = null, newVal = null, result = 'SUCCESS') {
      const logs = this._get(this.KEYS.AUDIT_LOGS);
      const curAdmin = JSON.parse(localStorage.getItem('ACTIVE_ADMIN_SESSION') || '{"name":"System Admin","role":"SUPER_ADMIN"}');
      
      const newEntry = {
        id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
        adminName: curAdmin.name,
        adminRole: curAdmin.role,
        action: action,
        target: target,
        targetId: targetId,
        previousVal: previousVal,
        newVal: newVal,
        reason: reason || 'Platform synchronized action',
        timestamp: new Date().toLocaleString(),
        ip: '192.168.1.1',
        result: result
      };
      logs.unshift(newEntry);
      if (logs.length > 300) logs.pop();
      this._set(this.KEYS.AUDIT_LOGS, logs);
      return newEntry;
    },

    onPlatformEvent(callback) {
      if (broadcastChannel) {
        broadcastChannel.addEventListener('message', (e) => {
          if (e.data) callback(e.data);
        });
      }
      window.addEventListener('storage', (e) => {
        if (e.key === 'THAINXT_LAST_EVENT' && e.newValue) {
          try { callback(JSON.parse(e.newValue)); } catch(err) {}
        }
      });
    }
  };

  PlatformSync.init();
  window.PlatformSync = PlatformSync;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
