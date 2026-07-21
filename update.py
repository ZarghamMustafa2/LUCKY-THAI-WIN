import re

with open('e:\\NUMBER BET\\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update VIP Club Button to link to dashboard
content = content.replace(
    '<button class="flex items-center gap-4 w-full px-5 py-3.5 hover:bg-white/5 rounded-2xl text-gray-400 hover:text-white font-bold transition-all group">\n        <i class="fa-solid fa-crown w-6 h-6 text-gold flex justify-center items-center text-lg group-hover:drop-shadow-[0_0_8px_rgba(255,212,0,0.5)] transition-all"></i> \n        <span class="font-display tracking-wide">VIP Club</span>\n      </button>',
    '<a href="dashboard.html" class="flex items-center gap-4 w-full px-5 py-3.5 hover:bg-white/5 rounded-2xl text-gray-400 hover:text-white font-bold transition-all group">\n        <i class="fa-solid fa-crown w-6 h-6 text-gold flex justify-center items-center text-lg group-hover:drop-shadow-[0_0_8px_rgba(255,212,0,0.5)] transition-all"></i> \n        <span class="font-display tracking-wide">VIP Club</span>\n      </a>'
)

# 2. Add Admin Panel link below Leaderboard
admin_link = """      <a href="admin.html" class="flex items-center gap-4 w-full px-5 py-3.5 hover:bg-white/5 rounded-2xl text-gray-400 hover:text-white font-bold transition-all group">
        <i class="fa-solid fa-shield-halved w-6 h-6 text-danger flex justify-center items-center text-lg group-hover:drop-shadow-[0_0_8px_rgba(255,77,79,0.5)] transition-all"></i> 
        <span class="font-display tracking-wide">Admin Panel</span>
      </a>"""

content = content.replace(
    '<span class="font-display tracking-wide">Leaderboard</span>\n      </button>',
    '<span class="font-display tracking-wide">Leaderboard</span>\n      </button>\n\n' + admin_link
)

# 3. Update Manual/Auto Buttons to have IDs
content = content.replace(
    '<button class="flex-1 bg-cardDark text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-md border border-white/10">Manual</button>\n              <button class="flex-1 text-gray-500 hover:text-gray-300 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">Auto</button>',
    '<button id="manualTabBtn" class="flex-1 bg-cardDark text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-md border border-white/10">Manual</button>\n              <button id="autoTabBtn" class="flex-1 text-gray-500 hover:text-gray-300 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">Auto</button>'
)

# 4. Add Cancel Button under Place Bet
cancel_btn = """              <button id="cancelBetBtn" class="w-full bg-danger/10 text-danger hover:bg-danger/20 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all hidden mt-2 border border-danger/30">
                Cancel Bet
              </button>"""

content = content.replace(
    '<span class="relative z-10">Place Bet</span>\n              </button>',
    '<span class="relative z-10">Place Bet</span>\n              </button>\n' + cancel_btn
)

# 5. Insert Javascript Logic for Auto Bet and Cancel Bet
js_additions = """
    // New Advanced Features State
    let isAutoBet = false;
    let autoBetConfig = null;
    
    const manualTabBtn = document.getElementById('manualTabBtn');
    const autoTabBtn = document.getElementById('autoTabBtn');
    const cancelBetBtn = document.getElementById('cancelBetBtn');

    manualTabBtn.addEventListener('click', () => {
        isAutoBet = false;
        manualTabBtn.classList.replace('text-gray-500', 'text-white');
        manualTabBtn.classList.replace('hover:text-gray-300', 'bg-cardDark');
        manualTabBtn.classList.add('shadow-md', 'border', 'border-white/10');
        
        autoTabBtn.classList.replace('text-white', 'text-gray-500');
        autoTabBtn.classList.replace('bg-cardDark', 'hover:text-gray-300');
        autoTabBtn.classList.remove('shadow-md', 'border', 'border-white/10');
        autoBetConfig = null;
        showToast('Switched to Manual Bet', 'info');
    });

    autoTabBtn.addEventListener('click', () => {
        isAutoBet = true;
        autoTabBtn.classList.replace('text-gray-500', 'text-white');
        autoTabBtn.classList.replace('hover:text-gray-300', 'bg-cardDark');
        autoTabBtn.classList.add('shadow-md', 'border', 'border-white/10');
        
        manualTabBtn.classList.replace('text-white', 'text-gray-500');
        manualTabBtn.classList.replace('bg-cardDark', 'hover:text-gray-300');
        manualTabBtn.classList.remove('shadow-md', 'border', 'border-white/10');
        showToast('Switched to Auto Bet mode', 'info');
    });

    cancelBetBtn.addEventListener('click', () => {
        if(currentBet && countdown > 3) {
            currentBalance += currentBet.amount;
            updateWalletUI();
            showToast(`Bet Cancelled. ฿${currentBet.amount} refunded.`, 'error');
            currentBet = null;
            placeBetBtn.disabled = false;
            placeBetBtn.innerHTML = `<div class="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_forwards]"></div><span class="relative z-10">Place Bet</span>`;
            placeBetBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'grayscale');
            cancelBetBtn.classList.add('hidden');
            autoBetConfig = null; // stop auto bet if cancelled manually
        } else {
            showToast('Cannot cancel bet now!', 'error');
        }
    });

    // We need to inject logic into placeBetBtn
"""

content = content.replace(
    '// Mock Activity Generator',
    js_additions + '\n    // Mock Activity Generator'
)

# Modify placeBet function to handle cancelBtn UI
content = content.replace(
    "placeBetBtn.innerHTML = '<span class=\"relative z-10\">Bet Placed!</span>';",
    "placeBetBtn.innerHTML = '<span class=\"relative z-10\">Bet Placed!</span>';\n      cancelBetBtn.classList.remove('hidden');\n      if(isAutoBet) { autoBetConfig = { amount, target }; }"
)

content = content.replace(
    "placeBetBtn.innerHTML = '<span class=\"relative z-10\">Locked</span>';",
    "placeBetBtn.innerHTML = '<span class=\"relative z-10\">Locked</span>';\n      cancelBetBtn.classList.add('hidden');"
)

# Modify finishDraw to re-place auto bet if needed
content = content.replace(
    'currentBet = null;',
    'currentBet = null;\n      if(isAutoBet && autoBetConfig && currentBalance >= autoBetConfig.amount) {\n        setTimeout(() => {\n          targetInput.value = autoBetConfig.target;\n          amountInput.value = autoBetConfig.amount;\n          placeBetBtn.click();\n        }, 3000);\n      } else if (isAutoBet && autoBetConfig) {\n        showToast("Insufficient balance for Auto Bet", "error");\n        manualTabBtn.click();\n      }'
)


with open('e:\\NUMBER BET\\index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated index.html successfully")
