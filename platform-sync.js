/**
 * ====================================================================
 *  PLATFORM-SYNC.JS — Central Single Source of Truth & Real-Time Sync
 *  Seamless Two-Way Synchronization between User Platform & Admin Panel
 *  Handles: Real Users · Wallets · Transactions · Deposits · Withdrawals
 *           Live Bets · KYC · Companies · Cross-Tab Event Broadcasting
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
    // Also trigger storage event for cross-tab legacy support
    try {
      localStorage.setItem('THAINXT_LAST_EVENT', JSON.stringify(eventObj));
    } catch(e) {}
  }

  // ─── 2. DEFAULT SEED DATA (Only loaded if storage is empty) ──────
  const SEED_COMPANIES = [
    { id: 'COMP-01', name: 'ThaiNXT Global Exchange (HQ)', code: 'GLOBAL', currency: 'PKR / INR', status: 'Active', usersCount: 1420 },
    { id: 'COMP-02', name: 'Apex Sports Asia Ltd.', code: 'APEX', currency: 'PKR', status: 'Active', usersCount: 580 },
    { id: 'COMP-03', name: 'Royal Bangkok Club Gaming', code: 'ROYAL', currency: 'INR', status: 'Active', usersCount: 310 }
  ];

  const SEED_USERS = [
    { 
      id: 'USR-1092', 
      username: 'Alex_Winner', 
      name: 'Alexander Wright', 
      phone: '+92 300 1234567', 
      email: 'alex.winner@gmail.com', 
      password: 'Password123',
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

  // ─── 3. CORE PLATFORM SYNCHRONIZATION ENGINE ─────────────────────

  const PlatformSync = {
    // Database Storage Keys
    KEYS: {
      USERS: 'ADM_USERS',
      DEPOSITS: 'ADM_DEPOSITS',
      WITHDRAWALS: 'ADM_WITHDRAWALS',
      TRANSACTIONS: 'ADM_TRANSACTIONS',
      COMPANIES: 'ADM_COMPANIES',
      GAMES: 'ADM_GAMES',
      AUDIT_LOGS: 'ADM_AUDIT_LOGS',
      KYC: 'ADM_KYC',
      BONUSES: 'ADM_BONUSES'
    },

    /** Initialize persistent storage if empty */
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
      if (!localStorage.getItem(this.KEYS.COMPANIES)) {
        localStorage.setItem(this.KEYS.COMPANIES, JSON.stringify(SEED_COMPANIES));
      }
    },

    _get(key) {
      try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e) { return []; }
    },

    _set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
    },

    // ─── USER REGISTRATION & AUTH SYNCHRONIZATION ──────────────────

    /**
     * Called when a user registers or logs in on index.html / auth.js
     * Automatically ensures user exists in central database and records login history.
     */
    registerOrLoginUser(username, password, phone = '', email = '') {
      this.init();
      const users = this._get(this.KEYS.USERS);
      let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toISOString().split('T')[0];

      if (!user) {
        // New Registration -> Auto-create in Central DB
        const newId = 'USR-' + (1090 + users.length + 1);
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
          companyId: 'COMP-01', // Default assigned company
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

        // Record Registration Audit Log
        this.logAudit('USER_REGISTERED', `User #${user.id}`, user.username, 'Player self-registered from website portal');
        broadcastEvent('USER_REGISTERED', user);
      } else {
        // Existing user login -> Update session info & credentials
        user.lastLogin = `Today, ${timeStr}`;
        if (password) user.password = password;
        if (!user.loginHistory) user.loginHistory = [];
        user.loginHistory.unshift({ timestamp: `${dateStr} ${timeStr}`, ip: '192.168.1.100', device: navigator.userAgent.substring(0, 40) });
        if (user.loginHistory.length > 20) user.loginHistory.pop();
        this._set(this.KEYS.USERS, users);
        broadcastEvent('USER_LOGIN', user);
      }

      // Sync active session keys for user-facing interface
      localStorage.setItem('userLoginName', user.username);
      localStorage.setItem('userWalletBalance', String(user.balance));
      return user;
    },

    /** Get Authoritative User Record */
    getUser(username) {
      this.init();
      const users = this._get(this.KEYS.USERS);
      return users.find(u => u.username.toLowerCase() === (username || '').toLowerCase()) || null;
    },

    /** Get Current User Authoritative Balance */
    getUserBalance(username) {
      const u = this.getUser(username);
      return u ? u.balance : 10450.00;
    },

    // ─── DEPOSIT WORKFLOW SYNCHRONIZATION ──────────────────────────

    /**
     * User creates a deposit request from deposit modal on index.html
     */
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

      // Append Pending Record to Transactions Ledger
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

    /**
     * Admin Approves Deposit -> Credits User Wallet & Updates Ledger
     */
    approveDeposit(depId, adminName = 'Finance Admin') {
      this.init();
      const deposits = this._get(this.KEYS.DEPOSITS);
      const dep = deposits.find(d => d.id === depId);
      if (!dep || dep.status !== 'Pending') return false;

      dep.status = 'Approved';
      dep.processedDate = new Date().toLocaleString();
      dep.processedBy = adminName;
      this._set(this.KEYS.DEPOSITS, deposits);

      // 1. Credit User Wallet in Central DB
      const users = this._get(this.KEYS.USERS);
      const user = users.find(u => u.username.toLowerCase() === dep.username.toLowerCase());
      if (user) {
        user.balance += dep.amount;
        user.totalDeposit = (user.totalDeposit || 0) + dep.amount;
        this._set(this.KEYS.USERS, users);

        // If this user is active in current browser tab, update local wallet
        if (localStorage.getItem('userLoginName') === user.username) {
          localStorage.setItem('userWalletBalance', String(user.balance));
          if (typeof window.updateWalletUI === 'function') window.updateWalletUI();
        }
      }

      // 2. Update Transaction Ledger
      const txs = this._get(this.KEYS.TRANSACTIONS);
      const tx = txs.find(t => t.ref === dep.ref);
      if (tx) tx.status = 'approved';
      this._set(this.KEYS.TRANSACTIONS, txs);

      // 3. Log Audit
      this.logAudit('DEPOSIT_APPROVED', `Deposit #${dep.id}`, dep.username, `Approved payment proof for Rs ${dep.amount}`);
      broadcastEvent('DEPOSIT_APPROVED', { deposit: dep, newBalance: user ? user.balance : null });
      return true;
    },

    /**
     * Admin Rejects Deposit -> Updates Status with Reason
     */
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

    /**
     * User requests a withdrawal on portal
     */
    createWithdrawalRequest(username, amount, method = 'Bank Transfer', account = '') {
      this.init();
      const user = this.getUser(username);
      if (!user || user.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Deduct balance immediately into locked state
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

    /**
     * Admin Approves Withdrawal -> Releases Payout & Updates Total Withdrawn
     */
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

    /**
     * Admin Rejects Withdrawal -> Refunds Locked Balance Back to User
     */
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

      // Refund balance to user
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

    // ─── BETTING & GAME ACTIVITY SYNCHRONIZATION ───────────────────

    /**
     * Called when a player places a bet in index.html or game.html (Thai 4D, Cricket, etc.)
     */
    recordBet(username, gameId, roundNumber, betNumber, amount) {
      this.init();
      const user = this.getUser(username);
      if (!user || user.balance < amount) {
        return false;
      }

      user.balance -= Number(amount);
      const users = this._get(this.KEYS.USERS);
      const uIdx = users.findIndex(u => u.id === user.id);
      if (uIdx > -1) users[uIdx] = user;
      this._set(this.KEYS.USERS, users);

      if (localStorage.getItem('userLoginName') === user.username) {
        localStorage.setItem('userWalletBalance', String(user.balance));
        if (typeof window.updateWalletUI === 'function') window.updateWalletUI();
      }

      // Record transaction
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

    /**
     * Called when a player wins a bet (Thai 4D draw, Casino, etc.)
     */
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

      // Record Win Transaction
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

    // ─── ADMIN AUDIT LOGGING ───────────────────────────────────────

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

    // ─── REAL-TIME EVENT LISTENER HOOKS ────────────────────────────

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

  // Auto initialize on load
  PlatformSync.init();

  window.PlatformSync = PlatformSync;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
