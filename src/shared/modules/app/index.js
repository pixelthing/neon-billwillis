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

  const modalScaffold = `
    <div class="Modal" data-js-modal>
      <div class="Modal-Background" data-js-modal-background>
        <div class="Modal-Content" data-js-modal-content></div>
      </div>
    </div>
  `;

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
      $(module.selector).each((i, el) => {
        let $el = $(el);
        if ($el.prop(module.selector)) { return; }
        module(el, self);
        $el.prop(module.selector, true);
      });
    });
  };

  const openModal = function(options) {
    $('body').append(modalScaffold);

    const $modal           = $('[data-js-modal]');
    const $modalBackground = $('[data-js-modal-background]');
    const $modalContent    = $('[data-js-modal-content]');
    const $close           = $('[data-js-modal-close]');

    if (options && options.content) {
      $modalContent.append(options.content);
    }

    $modal.toggleClass('Modal--Active');

    // close on esc and click on close
    $close.on('click', closeModal);
    $modalBackground.on('click', closeModal);
    $modalContent.on('click', (e) => e.preventDefault());

    $(document)
      .on('keyup.modal', (e) => {
        if (e.keyCode !== 27) { return; }
        closeModal();
      });
  };

  const closeModal = function(evt) {
    if (evt) { evt.preventDefault(); }
    const $modal = $('[data-js-modal]');
    $modal.toggleClass('Modal--Active');
    setTimeout(() => $modal.remove(), 300);
    $(document).off('keyup.modal');
  };

  const self = assign({
      registerModules,
      bindModules,
      openModal,
      closeModal,
      debug
    }
    
  );

  return self;
};

export default app;
