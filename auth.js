/**
 * ============================================================
 *  AUTH.JS — Lucky Thai Win Authentication System
 *  Handles: Login · Logout · Guest Login · Session State
 *  Version: 2.1 | Standalone Module | 100% In-Place (No Reload)
 * ============================================================
 */

(function (window) {
  'use strict';

  // ─── PRIVATE HELPERS ──────────────────────────────────────

  /** Read the current logged-in state from localStorage */
  function _readAuthState() {
    try {
      var val = localStorage.getItem('isUserLoggedIn');
      if (val === 'true')  return true;
      if (val === 'false') return false;
    } catch (e) {}
    return !!window.isUserLoggedInFallback;
  }

  /** Show the full-screen login overlay */
  function _showOverlay() {
    var overlay = document.getElementById('fullAppLoginOverlay');
    if (!overlay) return;
    overlay.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
    try {
      overlay.style.setProperty('display', 'flex', 'important');
      overlay.style.setProperty('opacity', '1', 'important');
      overlay.style.setProperty('pointer-events', 'auto', 'important');
      overlay.style.setProperty('z-index', '999999', 'important');
    } catch (err) {
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
      overlay.style.zIndex = '999999';
    }
  }

  /** Hide the full-screen login overlay */
  function _hideOverlay() {
    var overlay = document.getElementById('fullAppLoginOverlay');
    if (!overlay) return;
    overlay.classList.add('opacity-0', 'pointer-events-none', 'hidden');
    try {
      overlay.style.setProperty('display', 'none', 'important');
      overlay.style.setProperty('opacity', '0', 'important');
      overlay.style.setProperty('pointer-events', 'none', 'important');
    } catch (err) {
      overlay.style.display = 'none';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }
  }

  /** Close the profile dropdown */
  function _closeDropdown() {
    var dd = document.getElementById('profileDropdown');
    if (dd) dd.classList.add('hidden');
  }

  /** Set auth state in all storage layers */
  function _setLoggedIn(username) {
    window.isUserLoggedInFallback = true;
    try {
      localStorage.setItem('isUserLoggedIn', 'true');
      if (username) localStorage.setItem('userLoginName', username);
    } catch (e) {}
    try {
      document.cookie = 'isUserLoggedIn=true; path=/; max-age=31536000';
    } catch (e) {}
  }

  /** Clear auth state from all storage layers */
  function _clearAuthState() {
    window.isUserLoggedInFallback = false;

    // Clear localStorage
    try {
      localStorage.clear();
      localStorage.setItem('isUserLoggedIn', 'false');
    } catch (e) {}

    // Clear sessionStorage
    try { sessionStorage.clear(); } catch (e) {}

    // Expire all cookies
    try {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var eq  = cookies[i].indexOf('=');
        var key = eq > -1 ? cookies[i].substr(0, eq).trim() : cookies[i].trim();
        if (key) {
          document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
          document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
        }
      }
      document.cookie = 'isUserLoggedIn=false; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (e) {}
  }

  /** Save user to the registered-users list (for Admin Panel) */
  function _saveToUserList(username, password) {
    try {
      var list  = JSON.parse(localStorage.getItem('registeredUsersList') || '[]');
      var found = -1;
      for (var i = 0; i < list.length; i++) {
        if (list[i].username.toLowerCase() === username.toLowerCase()) {
          found = i; break;
        }
      }
      var record = {
        username:  username,
        password:  password || '123456',
        balance:   10450,
        source:    'Self Registered',
        status:    'Active',
        loginTime: new Date().toLocaleTimeString()
      };
      if (found > -1) {
        list[found].loginTime = record.loginTime;
        if (password) list[found].password = password;
      } else {
        list.push(record);
      }
      localStorage.setItem('registeredUsersList', JSON.stringify(list));
    } catch (e) {}
  }

  // ─── ADMIN PASSWORDS ──────────────────────────────────────
  var ADMIN_PASSWORDS = ['Qwer1234', 'admin123', '480amir@'];

  function _isAdminPassword(pw) {
    if (!pw) return false;
    var lower = pw.toLowerCase();
    for (var i = 0; i < ADMIN_PASSWORDS.length; i++) {
      if (pw === ADMIN_PASSWORDS[i] || lower === ADMIN_PASSWORDS[i].toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  // ─── PUBLIC API ───────────────────────────────────────────

  /**
   * AUTH.checkUserAuthStatus()
   * Reads auth state and shows/hides the login overlay accordingly.
   */
  window.checkUserAuthStatus = function () {
    var loggedIn = _readAuthState();
    if (loggedIn) {
      _hideOverlay();
    } else {
      _showOverlay();
    }
  };

  /**
   * AUTH.switchLoginAuthMode(mode)
   * Toggle between 'login' and 'register' tabs in the overlay.
   */
  window.switchLoginAuthMode = function (mode) {
    var loginBtn   = document.getElementById('loginTabBtn');
    var regBtn     = document.getElementById('registerTabBtn');
    var submitText = document.getElementById('authSubmitBtnText');
    if (!loginBtn || !regBtn || !submitText) return;

    var activeClass   = 'py-2.5 rounded-xl bg-gold text-black font-black uppercase tracking-wider transition-all shadow-md cursor-pointer';
    var inactiveClass = 'py-2.5 rounded-xl text-gray-400 hover:text-white uppercase tracking-wider transition-all cursor-pointer';

    if (mode === 'register') {
      regBtn.className   = activeClass;
      loginBtn.className = inactiveClass;
      submitText.innerText = 'CREATE ACCOUNT & ENTER';
    } else {
      loginBtn.className = activeClass;
      regBtn.className   = inactiveClass;
      submitText.innerText = 'LOGIN TO THAI WIN';
    }
  };

  /**
   * AUTH.handleAppLoginSubmit(e)
   * Processes the login form submission.
   */
  window.handleAppLoginSubmit = function (e) {
    if (e) {
      try {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
      } catch (err) {}
    }

    var nameInput = document.getElementById('authUsernameInput');
    var passInput = document.getElementById('authPasswordInput');
    var username  = nameInput && nameInput.value ? nameInput.value.trim() : '';
    var password  = passInput && passInput.value ? passInput.value.trim() : '';

    if (!username) {
      if (typeof window.showToast === 'function') {
        window.showToast('Please enter your username!', 'warning');
      }
      return false;
    }

    // Admin login — redirect to admin panel
    if (_isAdminPassword(password)) {
      _setLoggedIn(username || 'Super Admin');
      try {
        localStorage.setItem('isAdminAuth', 'true');
      } catch (e) {}
      if (typeof window.showToast === 'function') {
        window.showToast('Admin Verified! Opening Admin Panel...', 'success');
      }
      window.location.href = 'admin.html';
      return false;
    }

    // Standard player login
    _setLoggedIn(username);
    try {
      localStorage.setItem('isAdminAuth', 'false');
    } catch (e) {}

    // Register user in list for Admin Panel
    _saveToUserList(username, password);

    // Load session & update UI
    if (typeof window.loadActiveUserSession === 'function') {
      try { window.loadActiveUserSession(); } catch (err) {}
    }
    if (typeof window.updateUserProfileUI === 'function') {
      try { window.updateUserProfileUI(); } catch (err) {}
    }

    // Hide overlay
    _hideOverlay();

    if (typeof window.showToast === 'function') {
      window.showToast('Welcome, ' + username + '!', 'success');
    }
    return false;
  };

  /**
   * AUTH.handleQuickGuestLogin()
   * Instantly logs in as guest demo user "Alex_Winner".
   */
  window.handleQuickGuestLogin = function () {
    var guestName = 'Alex_Winner';
    _setLoggedIn(guestName);

    if (typeof window.updateUserProfileUI === 'function') {
      try { window.updateUserProfileUI(); } catch (err) {}
    }
    _hideOverlay();

    if (typeof window.showToast === 'function') {
      window.showToast('Guest Demo Login Successful!', 'success');
    }
  };

  /**
   * AUTH.showAppLoginOverlay(e)
   * Programmatically show the login overlay.
   */
  window.showAppLoginOverlay = function (e) {
    if (e) {
      try {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
      } catch (err) {}
    }
    _closeDropdown();
    _showOverlay();
  };

  /**
   * AUTH.closeAppLoginOverlay()
   * Close the overlay ONLY if the user is already logged in.
   */
  window.closeAppLoginOverlay = function () {
    if (!_readAuthState()) {
      if (typeof window.showToast === 'function') {
        window.showToast('Please log in with Username & Password to access dashboard.', 'info');
      }
      return;
    }
    _hideOverlay();
  };

  /**
   * AUTH.performUserLogout(e)
   * Smooth In-Place Logout (NO page refresh/reload):
   *  1. Clears localStorage, sessionStorage, cookies & in-memory auth state
   *  2. Clears login credentials input fields
   *  3. Closes profile dropdown & modals
   *  4. Shows login overlay instantly in-place
   *  5. Updates profile UI and shows toast notification
   */
  window.performUserLogout = function (e) {
    if (e) {
      try {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
      } catch (err) {}
    }

    try {
      // 1 — Clear all auth & session data
      _clearAuthState();
    } catch (err) {}

    try {
      // 2 — Clear inputs in login overlay
      var nameInput = document.getElementById('authUsernameInput');
      var passInput = document.getElementById('authPasswordInput');
      if (nameInput) nameInput.value = '';
      if (passInput) passInput.value = '';
    } catch (err) {}

    try {
      // 3 — Close profile dropdown & any open modals
      _closeDropdown();
      var modals = ['userLoginModal', 'profileStatementModal', 'profileProfitLossModal', 'profileBetHistoryModal'];
      modals.forEach(function(mId) {
        var el = document.getElementById(mId);
        if (el) el.classList.add('hidden');
      });
    } catch (err) {}

    try {
      // 4 — Show login overlay instantly in-place
      _showOverlay();
    } catch (err) {}

    try {
      // 5 — Update profile UI
      if (typeof window.updateUserProfileUI === 'function') {
        window.updateUserProfileUI();
      }
    } catch (err) {}

    try {
      // 6 — Show toast notification (No page reload)
      if (typeof window.showToast === 'function') {
        window.showToast('Logged out successfully.', 'info');
      }
    } catch (err) {}
  };

  /**
   * AUTH.isLoggedIn()
   */
  window.AuthSystem = {
    isLoggedIn:  _readAuthState,
    showOverlay: _showOverlay,
    hideOverlay: _hideOverlay,
    logout:      window.performUserLogout
  };

  // ─── INIT — attach listeners & initial check ─────────────

  function _attachLogoutBtn() {
    var btn = document.getElementById('logoutBtn');
    if (btn) {
      btn.onclick = function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        window.performUserLogout(e);
      };
      btn.addEventListener('click', function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        window.performUserLogout(e);
      });
      btn.addEventListener('touchend', function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        window.performUserLogout(e);
      });
    }
  }

  function _init() {
    if (typeof window.loadActiveUserSession === 'function') {
      try { window.loadActiveUserSession(); } catch (err) {}
    }
    if (typeof window.updateUserProfileUI === 'function') {
      try { window.updateUserProfileUI(); } catch (err) {}
    }
    window.checkUserAuthStatus();
    _attachLogoutBtn();
  }

  // Run on DOM ready or immediately if already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  // Also bind window load to be 100% sure
  window.addEventListener('load', _attachLogoutBtn);

})(window);
