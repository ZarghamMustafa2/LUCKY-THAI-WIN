const fs = require('fs');
const vm = require('vm');

const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) { return store[key] || null; },
    setItem: function(key, val) { store[key] = String(val); },
    removeItem: function(key) { delete store[key]; },
    clear: function() { store = {}; },
    _dump: function() { return store; }
  };
})();

const mockWindow = {
  localStorage: localStorageMock,
  sessionStorage: localStorageMock,
  document: { cookie: '' },
  navigator: { userAgent: 'Node.js Test Environment' },
  addEventListener: function() {},
  BroadcastChannel: function(name) {
    return {
      postMessage: function(msg) {},
      addEventListener: function() {}
    };
  }
};

const context = vm.createContext(mockWindow);

// 1. Load platform-sync.js into context
const syncCode = fs.readFileSync('platform-sync.js', 'utf8');
vm.runInContext(syncCode, context);

console.log('================================================================');
console.log('🎯 THAI WIN ACTIVE BETS & TICKET LEDGER AUTOMATED TEST SUITE');
console.log('================================================================\n');

// ─── TEST 1: Place Active Bets with Rich Metadata ─────────────────
console.log('--- TEST 1: Placing Active Bets with Real Metadata ---');

const user = 'Alex_Winner';
const activeBefore = context.PlatformSync.getUserActiveBets(user, 'GM-THAI-4D').length;

// Bet 1: 1D Figure on digit '7'
const bet1 = context.PlatformSync.recordGameActivity(
  user,
  'GM-THAI-4D',
  'Lucky Thai Win 4D Live',
  '8492',
  '7',
  100, // Rs 100 stake
  10,  // 10 VTK
  'PENDING',
  0,
  {
    betType: 'figure',
    betTypeName: '1D Figure',
    multiplier: 8,
    selectedRounds: ['1st Draw'],
    potentialPayout: 800
  }
);

console.log(`✓ Bet 1 Placed: Ticket #${bet1.ticketId} | Seq: [${bet1.betNumber}] | Stake: Rs ${bet1.stake} | Pot Win: Rs ${bet1.potentialPayout}`);

// Bet 2: 2D Akada on digits '84'
const bet2 = context.PlatformSync.recordGameActivity(
  user,
  'GM-THAI-4D',
  'Lucky Thai Win 4D Live',
  '8492',
  '84',
  500, // Rs 500 stake
  50,  // 50 VTK
  'PENDING',
  0,
  {
    betType: 'akada',
    betTypeName: '2D Akada',
    multiplier: 80,
    selectedRounds: ['1st Draw', '2nd Draw'],
    potentialPayout: 40000
  }
);

console.log(`✓ Bet 2 Placed: Ticket #${bet2.ticketId} | Seq: [${bet2.betNumber}] | Stake: Rs ${bet2.stake} | Pot Win: Rs ${bet2.potentialPayout}`);

// Bet 3: 4D Packet on digits '3629'
const bet3 = context.PlatformSync.recordGameActivity(
  user,
  'GM-THAI-4D',
  'Lucky Thai Win 4D Live',
  '8492',
  '3629',
  200, // Rs 200 stake
  20,  // 20 VTK
  'PENDING',
  0,
  {
    betType: 'packet',
    betTypeName: '4D Packet',
    multiplier: 6000,
    selectedRounds: ['1st Draw'],
    potentialPayout: 1200000
  }
);

console.log(`✓ Bet 3 Placed: Ticket #${bet3.ticketId} | Seq: [${bet3.betNumber}] | Stake: Rs ${bet3.stake} | Pot Win: Rs ${bet3.potentialPayout}`);
console.log('✓ PASS: All bets recorded with authoritative sequences and potential payouts.\n');

// ─── TEST 2: Query Active Bets API ────────────────────────────────
console.log('--- TEST 2: Querying Active Bets (In-Play) ---');
const activeBets = context.PlatformSync.getUserActiveBets(user, 'GM-THAI-4D');
console.log(`✓ Total Active Bets Found for ${user}: ${activeBets.length} (Was ${activeBefore}, now +3)`);

if (activeBets.length !== activeBefore + 3) {
  throw new Error(`TEST 2 FAILED: Expected ${activeBefore + 3} active bets, got ${activeBets.length}`);
}

const found1 = activeBets.find(b => b.id === bet1.id);
const found2 = activeBets.find(b => b.id === bet2.id);
const found3 = activeBets.find(b => b.id === bet3.id);

if (!found1 || !found2 || !found3) {
  throw new Error('TEST 2 FAILED: Placed bets not found in active bets query');
}

console.log(`  [Ticket 1] #${found1.ticketId} | Number: ${found1.betNumber} | Type: ${found1.betTypeName} | Result: ${found1.result} | Status: IN-PLAY`);
console.log(`  [Ticket 2] #${found2.ticketId} | Number: ${found2.betNumber} | Type: ${found2.betTypeName} | Result: ${found2.result} | Status: IN-PLAY`);
console.log(`  [Ticket 3] #${found3.ticketId} | Number: ${found3.betNumber} | Type: ${found3.betTypeName} | Result: ${found3.result} | Status: IN-PLAY`);

console.log('✓ PASS: Active bets query accurately isolates live in-play tickets.\n');

// ─── TEST 3: Bet Settlement Transition (Won / Lost) ───────────────────
console.log('--- TEST 3: Bet Settlement Transition (Won / Lost) ---');

// Simulate settlement of Bet 1 as WON
const activities = context.PlatformSync._get('ADM_GAME_ACTIVITIES');
const b1Index = activities.findIndex(a => a.id === bet1.id);
if (b1Index > -1) {
  activities[b1Index].result = 'WON';
  activities[b1Index].payout = 800;
  context.PlatformSync._set('ADM_GAME_ACTIVITIES', activities);
}

const activeAfterSettle = context.PlatformSync.getUserActiveBets(user, 'GM-THAI-4D');
const historyAfterSettle = context.PlatformSync.getUserBetsHistory(user, 'GM-THAI-4D');
const settledBet = historyAfterSettle.find(b => b.id === bet1.id);

console.log(`✓ Active Bets Remaining: ${activeAfterSettle.length}`);
console.log(`✓ Settled Bet #${settledBet.ticketId} Result: ${settledBet.result} (Payout: Rs ${settledBet.payout})`);

if (activeAfterSettle.some(b => b.id === bet1.id)) {
  throw new Error('TEST 3 FAILED: Settled bet still appears in active list');
}
if (!settledBet || settledBet.result !== 'WON') {
  throw new Error('TEST 3 FAILED: Settled bet not marked WON');
}

console.log('✓ PASS: Bet settlement transitions smoothly between Active and Settled tabs.\n');

// ─── TEST 4: DOM Elements Verification in game.html ───────────────
console.log('--- TEST 4: DOM Elements Verification in game.html ---');
const gameHtml = fs.readFileSync('game.html', 'utf8');

const requiredElements = [
  'id="myActiveBetsSection"',
  'id="activeBetsContainer"',
  'id="activeBetsCountBadge"',
  'id="tabBtn_activeBets"',
  'id="tabBtn_settledBets"',
  'id="tabBtn_allBets"',
  'id="navActiveBetsCount"',
  'id="dropdownActiveBetsCount"',
  'renderMyActiveBets',
  'switchActiveBetsTab'
];

requiredElements.forEach(item => {
  const found = gameHtml.includes(item);
  console.log(`✓ ${item}: ${found ? 'PRESENT' : 'MISSING'}`);
  if (!found) throw new Error(`TEST 4 FAILED: Missing element or function "${item}" in game.html`);
});

console.log('✓ PASS: All Active Bets UI components correctly embedded in game.html.\n');

console.log('================================================================');
console.log('🎉 ALL ACTIVE BETS & TICKET LEDGER TESTS PASSED (4/4)');
console.log('================================================================');
