/**
 * @module helperLocalstorage
 */
const helperLocalstorage = function(app) {

    let     checked = false;
    let     capable = false;

    const init = function() {
        // do this on idlecallback if possible
        if ('requestIdleCallback' in window) {
            requestIdleCallback(checkStorage);
        // otherwise, just push it out.
        } else {
            setTimeout(checkStorage,500);
        }
    };

    const hasStorage = function() {
        if (!checked) {
            checkStorage();
        }
        return capable;
    };
    
    const get = function(selector,local) {
        if (!hasStorage) {
            return false;
        }
        if (local) {
            return localStorage[selector];
        } else {
            return sessionStorage[selector];
        }
    };
    
    const set = function(selector,value,local) {
        if (!hasStorage) {
            return false;
        }
        if (local) {
            return localStorage.setItem(selector,value);
        } else {
            return sessionStorage.setItem(selector,value);
        }
    };
    
    const remove = function(selector,local) {
        if (!hasStorage) {
            return false;
        }
        if (local) {
            return localStorage.removeItem(selector);
        } else {
            return sessionStorage.removeItem(selector);
        }
    };
    
    const checkStorage = function() {
        let output = false;
        try {
            localStorage.setItem('mod', '1');
            localStorage.removeItem('mod');
            output =    true;
        } catch (exception) {
            output =    false;
        }
        checked = true;
        capable = output;
    };
    
    return {
        init: init(),
        get,
        set,
        remove,
        hasStorage
    };
};

export default helperLocalstorage;
