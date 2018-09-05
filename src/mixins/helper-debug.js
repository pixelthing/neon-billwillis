/**
 * @module helperDebug
 */
const helperDebug = function(app) {
  
  const init = function() {
    catchConsoleLog();
    initCacheKiller();
  };
  
  // stop the console erroring out on platforms that don't support
  const catchConsoleLog = function() {
    // silencing the console only happens on production
    if (location.hostname.indexOf('goteborgenergi.se') < 0) {
      return;
    }
    // so we're on production - captcha the console and silence it.
    if (typeof window.console === 'undefined') {
      window.console = function() {
        const nullFunction = function() {};
        return {
          log: nullFunction,
          warn: nullFunction,
          error: nullFunction
        };
      }();
    }
  };
  
  const initCacheKiller = function() {
    // cache-killer url
    if (window.location.search && window.location.search.indexOf('killcache') >= 0) {
      killCache();
    }
  };
  
  const killCache = function(selector) {
    
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
    window.location = '/';

  };
  
  return {
    init: init(),
    killCache
  };
};

export default helperDebug;
