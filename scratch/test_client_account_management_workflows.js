/**
 * test_client_account_management_workflows.js
 * Verification suite for Client Account Management Workflows:
 * 1. Settle P/L Account (S button -> Max Transfer calculation -> P/L to Cash transfer -> DB & ledger update)
 * 2. Cash / Credit Management (C button -> Deposit Credit -> Withdraw Credit -> Limit & Balance validation)
 * 3. Client Ledger (L button -> Client-isolated transactions -> Mathematical Running Balance calculation)
 */

const fs = require('fs');

const adminHtml = fs.readFileSync('e:\\NUMBER BET\\admin.html', 'utf8');
const adminEngineJs = fs.readFileSync('e:\\NUMBER BET\\admin-engine.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('  CLIENT ACCOUNT MANAGEMENT WORKFLOWS TEST SUITE');
console.log('====================================================');

// Mock DOM
const domElements = {};
const modalState = {};

global.document = {
  getElementById: (id) => {
    if (!domElements[id]) {
      domElements[id] = {
        innerText: '',
        innerHTML: '',
        value: '',
        checked: false,
        disabled: false,
        style: {},
        classList: {
          add: (...cls) => {
            if (cls.includes('hidden')) modalState[id] = false;
          },
          remove: (...cls) => {
            if (cls.includes('hidden')) modalState[id] = true;
          },
          contains: (c) => (c === 'hidden' ? !modalState[id] : false)
        }
      };
    }
    return domElements[id];
  },
  querySelector: () => null,
  cookie: '',
  addEventListener: () => {}
};

const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v)),
  removeItem: (k) => localStorageMap.delete(k)
};
global.sessionStorage = { clear: () => {} };
global.window = global;
global.window.addEventListener = () => {};

let lastToastMsg = '';
let lastToastType = '';
global.showAdminToast = (msg, type) => {
  lastToastMsg = msg;
  lastToastType = type || 'info';
  console.log(`  [Toast ${(type || 'info').toUpperCase()}] ${msg}`);
};
global.openModal = (id) => { modalState[id] = true; };
global.closeModal = (id) => { modalState[id] = false; };
global.applySidebarPermissions = () => {};
global.updateDashboardMetrics = () => {};

eval(adminEngineJs);

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
eval(roleConfigMatch[0]);

const summaryHelperMatch = adminHtml.match(/\/\*\*[\s\S]*?Single Source of Truth for Account Balance and Credit Data[\s\S]*?\n    \}/);
eval(summaryHelperMatch[0]);

const loadBalanceMatch = adminHtml.match(/let isUsersBalanceLoaded = false;[\s\S]*?function filterUsers\(\)/);
eval(loadBalanceMatch[0].replace('function filterUsers()', ''));

const colorFuncMatch = adminHtml.match(/function getHierarchyAccountColorClass\(authenticatedUser, targetAccount\) \{[\s\S]*?function getHierarchyAccountColorHex\(authenticatedUser, targetAccount\) \{[\s\S]*?\n    \}/);
eval(colorFuncMatch[0]);

const headerInfoMatch = adminHtml.match(/function updateAdminHeaderInfo\(\) \{[\s\S]*?\n    \}/);
eval(headerInfoMatch[0]);

const sessionPipelineMatch = adminHtml.match(/function lockAdminPanel\(\) \{[\s\S]*?function openAppAccountLoginModal\(\)/);
eval(sessionPipelineMatch[0].replace('function openAppAccountLoginModal()', ''));

const walletMatch = adminHtml.match(/let currentAdjustTab = 'CASH';[\s\S]*?function exportDataToCsv/);
eval(walletMatch[0].replace('function exportDataToCsv', ''));

const settleMatch = adminHtml.match(/let currentSettleTargetUser = null;[\s\S]*?function switchHierarchyViewMode/);
eval(settleMatch[0].replace('function switchHierarchyViewMode', ''));

// INITIALIZE TEST DATA (Mumtaz9300 reference client)
const adminUser = { id: 'COMP-ROOT-01', username: 'company', role: 'COMPANY', balance: 5000000, creditLimit: 5000000 };
const clientMumtaz = { id: 'USR-MUMTAZ9300', username: 'Mumtaz9300', role: 'USER', balance: 811604, creditLimit: 0, sharePercentage: 85 };

window.AdminCore.repo.set('ADM_ADMINS', [adminUser]);
window.AdminCore.repo.set('ADM_USERS', [adminUser, clientMumtaz]);
initializeCentralizedSession(adminUser);

// WORKFLOW 1: SETTLE P/L ACCOUNT
console.log('\n--- WORKFLOW 1: Settle P/L Account (Mumtaz9300) ---');
handleSettleAccount('Mumtaz9300');

assert(modalState['settleAccountModal'] === true, "Settle Account modal opened");
assert(document.getElementById('settleTargetUsernameDisplay').innerText === 'Mumtaz9300', "Target client heading shows 'Mumtaz9300'");
assert(document.getElementById('settleMaxTransferDisplay').innerText === '811,604 Rs.', "Maximum Transfer calculated dynamically as '811,604 Rs.'");

// Perform Settlement of 811604
document.getElementById('settleAmountInput').value = '811604';
document.getElementById('settleDescriptionInput').value = 'P/L to Cash transfer';
handleSettleAccountSubmit({ preventDefault: () => {} });

const updatedMumtaz = AdminCore.repo.get('ADM_USERS').find(u => u.username === 'Mumtaz9300');
assert(updatedMumtaz.balance === 0, "Client balance updated to 0 after P/L to Cash settlement");
assert(lastToastType === 'success', "Success toast displayed for P/L Settlement");

// WORKFLOW 2: CASH / CREDIT MANAGEMENT (DEPOSIT & WITHDRAW CREDIT)
console.log('\n--- WORKFLOW 2: Cash / Credit Management (Mumtaz9300) ---');
openAdjustWalletModal('Mumtaz9300');
switchAdjustWalletTab('CREDIT');

assert(document.getElementById('depositHeaderTitle').innerText.includes('Mumtaz9300'), "Deposit Credit header title dynamically includes Mumtaz9300");
assert(document.getElementById('withdrawHeaderTitle').innerText.includes('Mumtaz9300'), "Withdraw Credit header title dynamically includes Mumtaz9300");

// 2a. Deposit Credit 2,198,000
document.getElementById('depositAmountInput').value = '2198000';
document.getElementById('depositDescriptionInput').value = 'Credit Issued to Mumtaz9300';
handleDepositCashSubmit({ preventDefault: () => {} });

const afterDeposit = AdminCore.repo.get('ADM_USERS').find(u => u.username === 'Mumtaz9300');
assert(afterDeposit.creditLimit === 2198000, "Credit Limit updated to 2,198,000 after Credit Deposit");

// 2b. Withdraw Credit 811,604
openAdjustWalletModal('Mumtaz9300');
switchAdjustWalletTab('CREDIT');
document.getElementById('withdrawAmountInput').value = '811604';
document.getElementById('withdrawDescriptionInput').value = 'Credit Withdrawn from Mumtaz9300';
handleWithdrawCashSubmit({ preventDefault: () => {} });

const afterWithdraw = AdminCore.repo.get('ADM_USERS').find(u => u.username === 'Mumtaz9300');
assert(afterWithdraw.creditLimit === 1386396, "Credit Limit updated to 1,386,396 (2,198,000 - 811,604)");

// WORKFLOW 3: CLIENT ACCOUNT LEDGER & RUNNING BALANCE
console.log('\n--- WORKFLOW 3: Client Account Ledger & Running Balance ---');
openClientLedgerModal('Mumtaz9300');

assert(modalState['clientLedgerModal'] === true, "Client Ledger modal opened");
assert(document.getElementById('ledgerTargetUsernameDisplay').innerText === 'Mumtaz9300', "Ledger header shows 'Mumtaz9300'");

const tbodyHtml = document.getElementById('clientLedgerTableBody').innerHTML;
assert(tbodyHtml.includes('1,386,396'), "Running Balance 1,386,396 correctly displayed in ledger");
assert(tbodyHtml.includes('Credit Withdrawn from Mumtaz9300'), "Transaction description recorded in ledger");

console.log('\n====================================================');
console.log('  CLIENT ACCOUNT MANAGEMENT WORKFLOWS VERIFIED CLEAN');
console.log('====================================================\n');
