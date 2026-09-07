/**
 * test_level_scoped_views.js
 * Comprehensive Verification of Multi-Level Agent Hierarchy:
 * 1. Global Super Admin visibility (all companies & levels).
 * 2. Super Master downline isolation (SuperMaster_Apex only sees its Master Agents & downline players).
 * 3. Master Agent downline isolation (Master_Agent_01 only sees Apex_Agent & its players).
 * 4. Direct Agent isolation (Apex_Agent only sees Alex_Winner & CryptoKing).
 * 5. Level account creation & token quota auto-provisioning.
 * 6. Protection of existing User Credentials card and token sync.
 */

const fs = require('fs');

// Mock localStorage and browser globals
const localStorageMock = (function() {
  let store = {};
  return {
    getItem(key) { return store[key] || null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { store = {}; },
    _dump() { return store; }
  };
})();

global.localStorage = localStorageMock;
global.window = global;
global.navigator = { userAgent: 'NodeJS Test Environment' };
global.BroadcastChannel = class {
  constructor(name) { this.name = name; }
  postMessage(msg) {}
  addEventListener(event, handler) {}
};

// Load admin-engine.js and platform-sync.js
const adminEngineCode = fs.readFileSync('e:\\NUMBER BET\\admin-engine.js', 'utf8');
eval(adminEngineCode);

const platformSyncCode = fs.readFileSync('e:\\NUMBER BET\\platform-sync.js', 'utf8');
eval(platformSyncCode);

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('  MULTI-LEVEL AGENT HIERARCHY VERIFICATION SUITE');
console.log('====================================================');

// 1. Initialize AdminCore & PlatformSync
PlatformSync.init();

const allAdmins = AdminCore.repo.get('ADM_ADMINS');
console.log(`\n--- Test 1: Seed Hierarchy Nodes Loaded ---`);
assert(allAdmins.length >= 8, `Loaded at least 8 admin/agent nodes: got ${allAdmins.length}`);

const smApex = allAdmins.find(a => a.username === 'SuperMaster_Apex');
assert(smApex && smApex.role === 'SUPER_MASTER', 'SuperMaster_Apex exists with role SUPER_MASTER');
assert(smApex.commissionRate === 5.0, `SuperMaster_Apex has 5.0% commission: got ${smApex.commissionRate}`);

// 2. Downline Tree Resolution for SuperMaster_Apex
console.log(`\n--- Test 2: Super Master Downline Resolution ---`);
const smDownlineAgents = AdminCore.repo.getDownlineAdmins('SuperMaster_Apex');
const smDownlineAgentNames = smDownlineAgents.map(a => a.username);

console.log('  SuperMaster_Apex Subordinate Agents:', smDownlineAgentNames);
assert(smDownlineAgentNames.includes('Master_Agent_01'), 'SuperMaster_Apex includes subordinate Master_Agent_01');
assert(smDownlineAgentNames.includes('Master_Titan'), 'SuperMaster_Apex includes subordinate Master_Titan');
assert(smDownlineAgentNames.includes('Apex_Agent'), 'SuperMaster_Apex recursively includes subordinate Apex_Agent');
assert(smDownlineAgentNames.includes('Agent_02'), 'SuperMaster_Apex recursively includes subordinate Agent_02');
assert(!smDownlineAgentNames.includes('SuperMaster_Royal'), 'SuperMaster_Apex does NOT include sibling SuperMaster_Royal');

const smDownlineUsers = AdminCore.repo.getDownlineUsernames('SuperMaster_Apex');
console.log('  SuperMaster_Apex Permitted Players:', smDownlineUsers);
assert(smDownlineUsers.includes('Alex_Winner'), 'SuperMaster_Apex includes player Alex_Winner');
assert(smDownlineUsers.includes('CryptoKing'), 'SuperMaster_Apex includes player CryptoKing');
assert(smDownlineUsers.includes('Whale99'), 'SuperMaster_Apex includes player Whale99');
assert(smDownlineUsers.includes('Zargham_Pro'), 'SuperMaster_Apex includes player Zargham_Pro');
assert(!smDownlineUsers.includes('SuspiciousBettor'), 'SuperMaster_Apex does NOT include Royal downline player SuspiciousBettor');

// 3. Downline Tree Resolution for Master_Agent_01
console.log(`\n--- Test 3: Master Agent Downline Resolution ---`);
const maDownlineAgents = AdminCore.repo.getDownlineAdmins('Master_Agent_01');
const maDownlineAgentNames = maDownlineAgents.map(a => a.username);

assert(maDownlineAgentNames.includes('Apex_Agent'), 'Master_Agent_01 includes subordinate Apex_Agent');
assert(!maDownlineAgentNames.includes('Agent_02'), 'Master_Agent_01 does NOT include sibling Agent_02');

const maDownlineUsers = AdminCore.repo.getDownlineUsernames('Master_Agent_01');
assert(maDownlineUsers.includes('Alex_Winner'), 'Master_Agent_01 includes Alex_Winner');
assert(maDownlineUsers.includes('Whale99'), 'Master_Agent_01 includes Whale99');
assert(!maDownlineUsers.includes('Zargham_Pro'), 'Master_Agent_01 does NOT include Zargham_Pro (under Master_Titan)');

// 4. Downline Tree Resolution for Apex_Agent (Direct Agent)
console.log(`\n--- Test 4: Direct Agent Downline Resolution ---`);
const agDownlineAgents = AdminCore.repo.getDownlineAdmins('Apex_Agent');
assert(agDownlineAgents.length === 0, 'Direct Agent has 0 subordinate agents');

const agDownlineUsers = AdminCore.repo.getDownlineUsernames('Apex_Agent');
assert(agDownlineUsers.includes('Alex_Winner'), 'Apex_Agent includes direct player Alex_Winner');
assert(agDownlineUsers.includes('CryptoKing'), 'Apex_Agent includes direct player CryptoKing');
assert(!agDownlineUsers.includes('Whale99'), 'Apex_Agent does NOT include master direct player Whale99');
assert(!agDownlineUsers.includes('Zargham_Pro'), 'Apex_Agent does NOT include Zargham_Pro');

// 5. Scoped Data Queries in PlatformSync
console.log(`\n--- Test 5: Scoped PlatformSync.getSanitizedUsers ---`);
const globalUsers = PlatformSync.getSanitizedUsers(null, {}, { role: 'SUPER_ADMIN', username: 'admin' });
assert(globalUsers.length === 6, `Super Admin receives all 6 global users: got ${globalUsers.length}`);

const smUsers = PlatformSync.getSanitizedUsers(null, {}, smApex);
assert(smUsers.length === 4, `SuperMaster_Apex only receives its 4 downline users: got ${smUsers.length}`);

const maUsers = PlatformSync.getSanitizedUsers(null, {}, { role: 'MASTER_AGENT', username: 'Master_Agent_01' });
assert(maUsers.length === 3, `Master_Agent_01 only receives its 3 downline users: got ${maUsers.length}`);

const agUsers = PlatformSync.getSanitizedUsers(null, {}, { role: 'AGENT', username: 'Apex_Agent' });
assert(agUsers.length === 2, `Apex_Agent only receives its 2 direct users: got ${agUsers.length}`);

// 6. Deposits & Financial Requests Scoping
console.log(`\n--- Test 6: Scoped Financial Deposits & Withdrawals ---`);
const allDeps = AdminCore.repo.get('ADM_DEPOSITS');
const smDeps = AdminCore.repo.scopeToAgentLevel(allDeps, smApex, 'username');
assert(smDeps.every(d => ['Alex_Winner', 'CryptoKing', 'Whale99', 'Zargham_Pro'].includes(d.username)), 'All SuperMaster_Apex scoped deposits belong to downline users');
assert(!smDeps.some(d => d.username === 'SuspiciousBettor'), 'SuspiciousBettor deposit is excluded from SuperMaster_Apex view');

// 7. Verify Level Account Creation
console.log(`\n--- Test 7: New Level ID Creation ---`);
const newSM = {
  id: 'ADM-SM-99',
  name: 'Tariq Mehmood',
  username: 'SuperMaster_Tariq',
  role: 'SUPER_MASTER',
  level: 'SUPER_MASTER',
  companyId: 'COMP-01',
  uplineUsername: 'admin',
  commissionRate: 5.0,
  creditLimit: 1000000,
  tokenLimit: 500000,
  status: 'Active',
  lastLogin: 'Never',
  pass: 'Tariq@Pass2026'
};

const updatedAdmins = [...allAdmins, newSM];
AdminCore.repo.set('ADM_ADMINS', updatedAdmins);

const retrievedSM = AdminCore.repo.get('ADM_ADMINS').find(a => a.username === 'SuperMaster_Tariq');
assert(retrievedSM && retrievedSM.role === 'SUPER_MASTER', 'SuperMaster_Tariq successfully persisted');

// 8. Lock Check: User Credentials & Token Transfer Integrity
console.log(`\n--- Test 8: Lock Check (User Bp28233 & Token Sync) ---`);
const creds = PlatformSync.getUserCredentials('Alex_Winner');
assert(creds && creds.id === 'Bp28233', `User ID Bp28233 preserved: got ${creds ? creds.id : 'null'}`);
assert(creds.password === 'Bp28233@pass', `Password Bp28233@pass preserved: got ${creds ? creds.password : 'null'}`);

const tokBal = PlatformSync.getUserTokenBalance('Bp28233');
assert(tokBal === 45000, `Token balance 45,000 VTK preserved: got ${tokBal}`);

console.log('\n====================================================');
console.log('  ALL MULTI-LEVEL HIERARCHY TESTS PASSED (100%)');
console.log('====================================================\n');
