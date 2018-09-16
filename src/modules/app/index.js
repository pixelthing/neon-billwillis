import assign          from 'lodash.assign';
import helperDebug     from '../../mixins/helper-debug';

/**
 * @module
 * the app is responsible for global events and
 * responsibilities.
 */

const app = function() {

  // cache a couple of commonly used jquery items
  const debug = helperDebug();
  let   analytics = null;
  let   consumption = 0;

  // this array holds all the javascript modules
  // that should be wired when the page loads.
  let modules = [];

  /**
   * Registers and binds the modules passed.
   */
  const registerModules = function(modulesToRegister) {
    bindModules(modulesToRegister);
    modules = modules.concat(modulesToRegister);
  };

  /**
   * binds the modules by instantiating and running
   * them on each element matching the selector registered for
   * the module.
   *
   * if no modules is passed, it will rebind every module registerd.
   */
  const bindModules = function(mods) {
    mods = mods || modules;

    mods.forEach((module) => {
      document.querySelectorAll(module.selector).forEach((el, i) => {
        if (el.getAttribute('data-bound') === module.selector) { return; }
        module(el, self);
        el.setAttribute('data-bound', module.selector);
      });
    });
  };

  const self = assign({
      registerModules,
      bindModules,
      debug
    }
    
  );

  return self;
};

export default app;
