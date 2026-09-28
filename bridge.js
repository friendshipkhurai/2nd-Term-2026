/* FEA GitHub Pages bridge
   This emulates google.script.run so the existing FEA pages can run from GitHub Pages.
   Change only API_URL below after deploying the Apps Script backend.
*/
const FEA_API_URL = 'https://script.google.com/macros/s/AKfycbwZLvO2ADPj3hWJsX-1Je-wC0ax30C1nEUp1E0xfpSc4Y-bDpBP8OXT-2j_3PyTQAgvZA/exec';

(function () {
  const state = { success: null, failure: null, userObject: null };
  function callServer(method, args, success, failure) {
    if (!FEA_API_URL || FEA_API_URL.indexOf('PASTE_YOUR_') === 0) {
      const err = new Error('FEA API URL is not configured. Open js/bridge.js and paste your Apps Script /exec URL.');
      if (failure) failure(err, state.userObject);
      else console.error(err);
      return;
    }
    fetch(FEA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: method, args: args || [] })
    })
    .then(r => r.text())
    .then(text => {
      let packet;
      try { packet = JSON.parse(text); }
      catch (e) { throw new Error('Invalid API response: ' + text.slice(0, 300)); }
      if (packet.success) {
        if (success) success(packet.data, state.userObject);
      } else {
        const err = new Error(packet.error || 'Server request failed');
        if (failure) failure(err, state.userObject); else console.error(err);
      }
    })
    .catch(err => { if (failure) failure(err, state.userObject); else console.error(err); });
  }
  const runProxy = new Proxy({}, {
    get(_target, prop) {
      if (prop === 'withSuccessHandler') return fn => { state.success = fn; return runProxy; };
      if (prop === 'withFailureHandler') return fn => { state.failure = fn; return runProxy; };
      if (prop === 'withUserObject') return obj => { state.userObject = obj; return runProxy; };
      return (...args) => {
        const success = state.success, failure = state.failure;
        state.success = state.failure = state.userObject = null;
        callServer(String(prop), args, success, failure);
      };
    }
  });
  window.google = window.google || {};
  window.google.script = window.google.script || {};
  window.google.script.run = runProxy;
})();
