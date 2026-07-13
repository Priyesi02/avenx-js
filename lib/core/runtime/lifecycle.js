import { styleMountManager } from './StyleMountManager.js';

/**
 * Manages the lifecycle of Avenx components.
 */
export class LifecycleManager {
  /**
   * Mounts a component to a target element and performs the initial update.
   * Injects runtime styles for the component class if not already present.
   * @param {AvenxComponent} component - The component instance to mount.
   * @param {Element|string} target - The target DOM element or selector.
   */
  mount(component, target) {
    const targetEl = typeof target === 'string' ? document.querySelector(target) : target;

    // Mount runtime styles (deduplicated per component class)
    styleMountManager.mount(component.constructor);

    component.__setMountTarget(targetEl);
    component.update();
    if (component.__afterMount) {
      component.__afterMount();
    }
  }
}
