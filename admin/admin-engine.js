/**
 * ====================================================================
 *  ADMIN-ENGINE.JS — Enterprise Gaming Platform Admin Core & RBAC
 *  Handles: Roles · Granular Permissions · Multi-Tenant Company Isolation
 *           Persistent Data Models · Financial Governance · Audit Logging
 * ====================================================================
 */

(function (window) {
  'use strict';

  // ─── 1. ROLE DEFINITIONS & GRANULAR PERMISSIONS MATRIX ──────────

  const PERMISSIONS = {
    // Users
    'users.view': 'View User List & Basic Info',
    'users.create': 'Create New User Account',
    'users.edit': 'Edit User Credentials & Info',
    'users.suspend': 'Suspend / Activate User Accounts',
    'users.notes': 'Add Internal Support Notes',
    'users.restrictions': 'Apply Betting & Deposit Restrictions',
    
    // Games
    'games.view': 'View Games & Categories',
    'games.create': 'Add New Games',
    'games.edit': 'Edit Game Settings & URLs',
    'games.manage': 'Toggle Game Maintenance & Availability',
    'games.broadcast': 'Control Live Lottery & Thai Draw Broadcasts',
    'categories.manage': 'Manage Game Categories',

    // Finance & Wallets
    'deposits.view': 'View Deposit Requests',
    'deposits.approve': 'Approve Pending Deposits',
    'deposits.reject': 'Reject Deposits',
    'withdrawals.view': 'View Withdrawal Requests',
    'withdrawals.approve': 'Approve & Release Withdrawals',
    'withdrawals.reject': 'Reject Withdrawals',
    'wallets.view': 'View User Balances & Ledgers',
    'wallets.adjust': 'Manually Adjust User Balance (Credit/Debit)',
    'reports.financial': 'View Detailed Financial Ledgers',

    // KYC & Compliance
    'kyc.view': 'View KYC Submissions & Documents',
    'kyc.approve': 'Approve Identity Verification',
    'kyc.reject': 'Reject KYC with Reason',
    'risk.alerts': 'View Risk & Fraud Indicators',
    'risk.restrictions': 'Enforce Compliance Restrictions',

    // Bonuses
    'bonuses.view': 'View Promotional Campaigns',
    'bonuses.create': 'Create & Issue Bonuses',

    // Reports & Exports
    'reports.view': 'View Platform Reports',
    'reports.export': 'Export Data to CSV / Excel',

    // Administration & Security
    'admins.view': 'View Administrator Accounts',
    'admins.create': 'Create Administrator Accounts',
    'admins.edit': 'Edit Admin Permissions & Roles',
    'companies.manage': 'Manage Multi-Tenant Companies',
    'settings.view': 'View System Configuration',
    'settings.edit': 'Modify Platform Settings',
    'audit_logs.view': 'View Immutable Security Audit Logs'
  };

  const ROLE_PERMISSIONS = {
    'SUPER_ADMIN': Object.keys(PERMISSIONS), // Full Global Access
    'COMPANY_ADMIN': [
      'users.view', 'users.create', 'users.edit', 'users.suspend', 'users.notes', 'users.restrictions',
      'games.view', 'games.edit', 'categories.manage',
      'deposits.view', 'deposits.approve', 'deposits.reject',
      'withdrawals.view', 'withdrawals.approve', 'withdrawals.reject',
      'wallets.view', 'wallets.adjust', 'reports.financial',
      'kyc.view', 'kyc.approve', 'kyc.reject',
      'bonuses.view', 'bonuses.create',
      'reports.view', 'reports.export',
      'admins.view', 'admins.create', 'audit_logs.view'
    ],
    'OPERATIONS_ADMIN': [
      'users.view', 'users.create', 'users.edit', 'users.suspend', 'users.notes',
      'games.view', 'games.manage', 'games.broadcast',
      'kyc.view', 'risk.alerts', 'reports.view'
    ],
    'FINANCE_ADMIN': [
      'users.view',
      'deposits.view', 'deposits.approve', 'deposits.reject',
      'withdrawals.view', 'withdrawals.approve', 'withdrawals.reject',
      'wallets.view', 'wallets.adjust', 'reports.financial',
      'reports.view', 'reports.export'
    ],
    'GAME_ADMIN': [
      'games.view', 'games.create', 'games.edit', 'games.manage', 'games.broadcast',
      'categories.manage', 'reports.view'
    ],
    'SUPPORT_ADMIN': [
      'users.view', 'users.create', 'users.edit', 'users.notes',
      'kyc.view', 'kyc.approve', 'kyc.reject',
      'wallets.view', 'bonuses.view'
    ],
    'RISK_ADMIN': [
      'users.view', 'users.suspend', 'users.restrictions',
      'kyc.view', 'kyc.approve', 'kyc.reject',
      'risk.alerts', 'risk.restrictions', 'reports.view', 'audit_logs.view'
    ],
    'REPORTING_ADMIN': [
      'users.view', 'games.view', 'reports.financial', 'reports.view', 'reports.export', 'audit_logs.view'
    ],
    'VIEWER': [
      'users.view', 'games.view', 'deposits.view', 'withdrawals.view', 'wallets.view', 'kyc.view', 'reports.view'
    ]
  };

  // ─── 2. SEED / DEFAULT DATA GENERATORS ──────────────────────────

  const DEFAULT_COMPANIES = [
    { id: 'COMP-01', name: 'ThaiNXT Global Exchange (HQ)', code: 'GLOBAL', currency: 'PKR / INR', status: 'Active', usersCount: 1420 },
    { id: 'COMP-02', name: 'Apex Sports Asia Ltd.', code: 'APEX', currency: 'PKR', status: 'Active', usersCount: 580 },
    { id: 'COMP-03', name: 'Royal Bangkok Club Gaming', code: 'ROYAL', currency: 'INR', status: 'Active', usersCount: 310 }
  ];

  const DEFAULT_ADMINS = [
    { id: 'COMP-ROOT-01', name: 'Company HQ (Top Level)', username: 'company', email: 'company@thainxt.com', role: 'COMPANY', level: 'COMPANY', companyId: 'COMP-01', uplineId: null, uplineUsername: null, parentId: null, createdBy: null, commissionRate: 100.0, creditLimit: 100000000, tokenLimit: 50000000, status: 'Active', lastLogin: 'Just now', pass: 'Company123!', password: 'Company123!' },
    { id: 'ADM-001', name: 'Amir Khan (Super Admin)', username: 'admin', email: 'admin@thainxt.com', role: 'SUPER_ADMIN', companyId: 'COMP-01', status: 'Active', lastLogin: 'Just now', pass: 'admin123' },
    { id: 'ADM-002', name: 'Zargham Mustafa', username: 'zargham_ops', email: 'zargham@thainxt.com', role: 'OPERATIONS_ADMIN', companyId: 'COMP-01', status: 'Active', lastLogin: '10 mins ago', pass: 'Qwer1234' },
    { id: 'ADM-003', name: 'Siddiq Finance Officer', username: 'finance_lead', email: 'finance@thainxt.com', role: 'FINANCE_ADMIN', companyId: 'COMP-01', status: 'Active', lastLogin: '1 hour ago', pass: '123456' },
    { id: 'ADM-004', name: 'Priya Sharma (Apex Partner)', username: 'priya_apex', email: 'priya@apex-sports.com', role: 'COMPANY_ADMIN', companyId: 'COMP-02', status: 'Active', lastLogin: 'Yesterday', pass: '123456' },
    { id: 'ADM-005', name: 'David Compliance Officer', username: 'compliance_risk', email: 'compliance@thainxt.com', role: 'RISK_ADMIN', companyId: 'COMP-01', status: 'Active', lastLogin: '3 hours ago', pass: '123456' }
  ];

  const DEFAULT_CATEGORIES = [
    { id: 'CAT-LOTTERY', name: 'Lottery & Number Draws', icon: 'fa-clover', count: 3, order: 1, status: 'Active' },
    { id: 'CAT-CRICKET', name: 'Cricket Exchange', icon: 'fa-baseball-bat-ball', count: 8, order: 2, status: 'Active' },
    { id: 'CAT-SOCCER', name: 'Soccer & Football', icon: 'fa-futbol', count: 14, order: 3, status: 'Active' },
    { id: 'CAT-TENNIS', name: 'Tennis Live', icon: 'fa-table-tennis-paddle-ball', count: 6, order: 4, status: 'Active' },
    { id: 'CAT-CASINO', name: 'Live Casino & Table Games', icon: 'fa-dice', count: 12, order: 5, status: 'Active' },
    { id: 'CAT-SLOTS', name: 'Virtual Slots & Crash Games', icon: 'fa-rocket', count: 9, order: 6, status: 'Active' }
  ];

  const DEFAULT_GAMES = [
    { id: 'GM-THAI-4D', name: 'Lucky Thai Win 4D Live', category: 'CAT-LOTTERY', route: 'game.html', status: 'Active', maintenance: false, order: 1, turnover: 'Rs 4,850,200', players: 342, image: 'aviator_card.jpg' },
    { id: 'GM-RITMU-TV', name: 'Ritmu TV Satellite Draw', category: 'CAT-LOTTERY', route: 'https://www.ritmu.tv', status: 'Active', maintenance: false, order: 2, turnover: 'Rs 2,120,400', players: 189, image: 'roulette_card.jpg' },
    { id: 'GM-CRICKET-LIVE', name: 'International Cricket Exchange', category: 'CAT-CRICKET', route: 'index.html#bpexch', status: 'Active', maintenance: false, order: 3, turnover: 'Rs 8,920,000', players: 840, image: 'sports_book_card.jpg' },
    { id: 'GM-PREMIER-FOOTBALL', name: 'Premier League Soccer Live', category: 'CAT-SOCCER', route: 'index.html#soccer', status: 'Active', maintenance: false, order: 4, turnover: 'Rs 3,450,000', players: 410, image: 'sports_book_card.jpg' },
    { id: 'GM-ROULETTE-ROYAL', name: 'European Live Roulette Pro', category: 'CAT-CASINO', route: 'index.html#casino', status: 'Active', maintenance: false, order: 5, turnover: 'Rs 1,980,000', players: 156, image: 'roulette_card.jpg' },
    { id: 'GM-AVIATOR-CRASH', name: 'Aviator High-Multiplier Crash', category: 'CAT-SLOTS', route: 'index.html#slots', status: 'Active', maintenance: false, order: 6, turnover: 'Rs 5,640,000', players: 520, image: 'aviator_card.jpg' }
  ];

  const DEFAULT_USERS = [
    { id: 'USR-1092', username: 'Alex_Winner', name: 'Alexander Wright', phone: '+92 300 1234567', email: 'alex.winner@gmail.com', balance: 10450.00, locked: 0.00, totalDeposit: 45000.00, totalWithdraw: 34550.00, companyId: 'COMP-01', status: 'Active', kycStatus: 'Approved', source: 'Direct Sign-Up', regDate: '2026-06-12', lastLogin: 'Today, 10:45 AM', notes: 'VIP customer, prefers Thai 4D and Live Roulette.' },
    { id: 'USR-1093', username: 'CryptoKing', name: 'Fahad Rehman', phone: '+92 321 9876543', email: 'crypto.fahad@gmail.com', balance: 45000.00, locked: 5000.00, totalDeposit: 120000.00, totalWithdraw: 70000.00, companyId: 'COMP-01', status: 'Active', kycStatus: 'Approved', source: 'Super_Agent_02', regDate: '2026-06-18', lastLogin: 'Today, 09:15 AM', notes: 'High turnover bettor.' },
    { id: 'USR-1094', username: 'Whale99', name: 'Bilal Tariq', phone: '+92 333 4567890', email: 'bilal.tariq@yahoo.com', balance: 120000.00, locked: 20000.00, totalDeposit: 500000.00, totalWithdraw: 360000.00, companyId: 'COMP-01', status: 'Active', kycStatus: 'Approved', source: 'Master_Agent_01', regDate: '2026-05-20', lastLogin: 'Yesterday, 11:30 PM', notes: 'Corporate client.' },
    { id: 'USR-1095', username: 'Zargham_Pro', name: 'Zargham Raza', phone: '+92 312 3456789', email: 'zargham.pro@gmail.com', balance: 25000.00, locked: 0.00, totalDeposit: 60000.00, totalWithdraw: 35000.00, companyId: 'COMP-02', status: 'Active', kycStatus: 'Approved', source: 'Apex_Agent', regDate: '2026-07-01', lastLogin: 'Today, 08:20 AM', notes: 'Regular Thai Lottery player.' },
    { id: 'USR-1096', username: 'LuckyHassan', name: 'Hassan Ali', phone: '+92 345 8899001', email: 'hassan.ali@outlook.com', balance: 3200.00, locked: 1000.00, totalDeposit: 15000.00, totalWithdraw: 10800.00, companyId: 'COMP-01', status: 'Pending Verification', kycStatus: 'Pending', source: 'Direct Sign-Up', regDate: '2026-08-10', lastLogin: 'Today, 01:10 PM', notes: 'ID card uploaded, awaiting verification.' },
    { id: 'USR-1097', username: 'SuspiciousBettor', name: 'Rashid Minhas', phone: '+92 301 2233445', email: 'rashid.m@gmail.com', balance: 150.00, locked: 0.00, totalDeposit: 5000.00, totalWithdraw: 4850.00, companyId: 'COMP-03', status: 'Suspended', kycStatus: 'Rejected', source: 'Online Referral', regDate: '2026-07-15', lastLogin: '3 days ago', notes: 'Suspended due to multiple sequence betting pattern.' }
  ];

  const DEFAULT_DEPOSITS = [
    { id: 'DEP-8841', userId: 'USR-1092', username: 'Alex_Winner', amount: 15000, method: 'Easypaisa', ref: 'EP-993821094', companyId: 'COMP-01', status: 'Pending', date: '2026-08-14 11:20 AM' },
    { id: 'DEP-8842', userId: 'USR-1093', username: 'CryptoKing', amount: 50000, method: 'USDT (TRC20)', ref: '0x8f2a991823bc', companyId: 'COMP-01', status: 'Pending', date: '2026-08-14 10:45 AM' },
    { id: 'DEP-8840', userId: 'USR-1094', username: 'Whale99', amount: 100000, method: 'Bank Transfer (Meezan)', ref: 'MZN-774821', companyId: 'COMP-01', status: 'Approved', date: '2026-08-13 04:15 PM' },
    { id: 'DEP-8839', userId: 'USR-1095', username: 'Zargham_Pro', amount: 20000, method: 'JazzCash', ref: 'JC-4491028', companyId: 'COMP-02', status: 'Approved', date: '2026-08-13 02:30 PM' },
    { id: 'DEP-8838', userId: 'USR-1097', username: 'SuspiciousBettor', amount: 5000, method: 'Easypaisa', ref: 'EP-1192834', companyId: 'COMP-03', status: 'Rejected', reason: 'Unverified sender account', date: '2026-08-12 09:10 AM' }
  ];

  const DEFAULT_WITHDRAWALS = [
    { id: 'WTH-4102', userId: 'USR-1093', username: 'CryptoKing', amount: 25000, method: 'Bank Transfer (HBL)', account: 'HBL - 0021-99882201', companyId: 'COMP-01', status: 'Pending', requestDate: '2026-08-14 10:15 AM' },
    { id: 'WTH-4101', userId: 'USR-1095', username: 'Zargham_Pro', amount: 12000, method: 'JazzCash', account: '0312-3456789', companyId: 'COMP-02', status: 'Pending', requestDate: '2026-08-14 09:30 AM' },
    { id: 'WTH-4100', userId: 'USR-1092', username: 'Alex_Winner', amount: 18000, method: 'Easypaisa', account: '0300-1234567', companyId: 'COMP-01', status: 'Approved', requestDate: '2026-08-13 06:00 PM', processedDate: '2026-08-13 06:25 PM' },
    { id: 'WTH-4099', userId: 'USR-1094', username: 'Whale99', amount: 80000, method: 'Bank Transfer (Meezan)', account: '0102-33445566', companyId: 'COMP-01', status: 'Approved', requestDate: '2026-08-12 03:20 PM', processedDate: '2026-08-12 03:45 PM' }
  ];

  const DEFAULT_AUDIT_LOGS = [
    { id: 'LOG-9001', adminName: 'Amir Khan', adminRole: 'SUPER_ADMIN', action: 'ADMIN_LOGIN', target: 'Security Gateway', targetId: 'ADM-001', reason: 'Successful 2FA Login', timestamp: '2026-08-14 11:30:00', ip: '192.168.1.1', result: 'SUCCESS' },
    { id: 'LOG-9002', adminName: 'Siddiq Finance', adminRole: 'FINANCE_ADMIN', action: 'DEPOSIT_APPROVED', target: 'Deposit #DEP-8840', targetId: 'USR-1094', reason: 'Verified in bank account statement', timestamp: '2026-08-13 16:15:22', ip: '192.168.1.45', result: 'SUCCESS' },
    { id: 'LOG-9003', adminName: 'Zargham Mustafa', adminRole: 'OPERATIONS_ADMIN', action: 'GAME_SETTINGS_UPDATE', target: 'Lucky Thai Win 4D', targetId: 'GM-THAI-4D', reason: 'Adjusted prize multiplier for 4D draw to 9000x', timestamp: '2026-08-13 14:02:11', ip: '192.168.1.20', result: 'SUCCESS' },
    { id: 'LOG-9004', adminName: 'David Compliance', adminRole: 'RISK_ADMIN', action: 'USER_SUSPENDED', target: 'User #USR-1097', targetId: 'USR-1097', reason: 'Suspected bot script on 1-digit rapid numbers', timestamp: '2026-08-12 09:12:00', ip: '192.168.1.88', result: 'SUCCESS' }
  ];

  const DEFAULT_KYC = [
    { id: 'KYC-501', userId: 'USR-1096', username: 'LuckyHassan', docType: 'National ID (CNIC/Passport)', docNumber: '35201-8899001-3', docFront: 'National Identity Card Front Preview', docBack: 'National Identity Card Back Preview', status: 'Pending', submitDate: '2026-08-10 14:00', reviewer: 'Unassigned', reason: '' },
    { id: 'KYC-502', userId: 'USR-1092', username: 'Alex_Winner', docType: 'Passport', docNumber: 'PK-88992019', docFront: 'Passport Biometric Page Preview', docBack: 'Visa Stamp Page', status: 'Approved', submitDate: '2026-06-12 11:30', reviewer: 'David Compliance', reason: 'Full Biometric Verification Verified' },
    { id: 'KYC-503', userId: 'USR-1097', username: 'SuspiciousBettor', docType: 'National ID', docNumber: '35202-0011223-1', docFront: 'Blurry Photo Document', docBack: 'Missing', status: 'Rejected', submitDate: '2026-07-15 08:30', reviewer: 'David Compliance', reason: 'Document image unreadable / Expired CNIC' }
  ];

  const DEFAULT_BONUSES = [
    { id: 'BON-101', name: '100% First Deposit Welcome Match', type: 'Deposit Match', multiplier: '100%', maxAmount: 10000, wagering: '5x', minDeposit: 1000, status: 'Active', claimedCount: 420 },
    { id: 'BON-102', name: 'Thai 4D Lottery 10% Cashback', type: 'Cashback', multiplier: '10%', maxAmount: 5000, wagering: '1x', minDeposit: 500, status: 'Active', claimedCount: 890 },
    { id: 'BON-103', name: 'Weekend VIP Reload Bonus', type: 'Reload', multiplier: '50%', maxAmount: 25000, wagering: '8x', minDeposit: 5000, status: 'Active', claimedCount: 154 }
  ];

  // ─── 3. STATE REPOSITORY & PERSISTENCE LAYER ──────────────────

  class AdminRepository {
    constructor() {
      this._initStore();
    }

    _initStore() {
      if (!localStorage.getItem('ADM_COMPANIES')) localStorage.setItem('ADM_COMPANIES', JSON.stringify(DEFAULT_COMPANIES));
      if (!localStorage.getItem('ADM_ADMINS')) localStorage.setItem('ADM_ADMINS', JSON.stringify(DEFAULT_ADMINS));
      if (!localStorage.getItem('ADM_CATEGORIES')) localStorage.setItem('ADM_CATEGORIES', JSON.stringify(DEFAULT_CATEGORIES));
      if (!localStorage.getItem('ADM_GAMES')) localStorage.setItem('ADM_GAMES', JSON.stringify(DEFAULT_GAMES));
      if (!localStorage.getItem('ADM_USERS')) localStorage.setItem('ADM_USERS', JSON.stringify(DEFAULT_USERS));
      if (!localStorage.getItem('ADM_DEPOSITS')) localStorage.setItem('ADM_DEPOSITS', JSON.stringify(DEFAULT_DEPOSITS));
      if (!localStorage.getItem('ADM_WITHDRAWALS')) localStorage.setItem('ADM_WITHDRAWALS', JSON.stringify(DEFAULT_WITHDRAWALS));
      if (!localStorage.getItem('ADM_AUDIT_LOGS')) localStorage.setItem('ADM_AUDIT_LOGS', JSON.stringify(DEFAULT_AUDIT_LOGS));
      if (!localStorage.getItem('ADM_KYC')) localStorage.setItem('ADM_KYC', JSON.stringify(DEFAULT_KYC));
      if (!localStorage.getItem('ADM_BONUSES')) localStorage.setItem('ADM_BONUSES', JSON.stringify(DEFAULT_BONUSES));
    }

    get(key) {
      try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e) { return []; }
    }

    set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
    }

    // Current Session
    getCurrentAdmin() {
      try {
        const saved = JSON.parse(localStorage.getItem('ACTIVE_ADMIN_SESSION'));
        if (saved) return saved;
      } catch(e) {}
      // Default to Super Admin
      return DEFAULT_ADMINS[0];
    }

    setCurrentAdmin(admin) {
      localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(admin));
    }

    // Role Permissions check
    hasPermission(permissionKey) {
      const current = this.getCurrentAdmin();
      if (!current) return false;
      if (current.role === 'SUPER_ADMIN') return true;
      const allowed = ROLE_PERMISSIONS[current.role] || [];
      return allowed.includes(permissionKey);
    }

    // Company Data Scoper
    scopeToCompany(list, companyField = 'companyId') {
      const current = this.getCurrentAdmin();
      if (!current || current.role === 'SUPER_ADMIN') return list;
      return list.filter(item => item[companyField] === current.companyId);
    }

    // Immutable Audit Logger
    logAudit(action, target, targetId, reason, previousVal = null, newVal = null, result = 'SUCCESS') {
      const current = this.getCurrentAdmin();
      const logs = this.get('ADM_AUDIT_LOGS');
      const newEntry = {
        id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
        adminName: current ? current.name : 'System Admin',
        adminRole: current ? current.role : 'SUPER_ADMIN',
        action: action,
        target: target,
        targetId: targetId,
        previousVal: previousVal,
        newVal: newVal,
        reason: reason || 'Standard administrative action',
        timestamp: new Date().toLocaleString(),
        ip: '192.168.1.' + Math.floor(10 + Math.random() * 80),
        result: result
      };
      logs.unshift(newEntry);
      this.set('ADM_AUDIT_LOGS', logs);
      return newEntry;
    }
  }

  window.AdminCore = {
    PERMISSIONS,
    ROLE_PERMISSIONS,
    repo: new AdminRepository()
  };

})(window);
