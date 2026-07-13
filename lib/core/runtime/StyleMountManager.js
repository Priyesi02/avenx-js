/**
 * Manages runtime style injection for component classes.
 * Ensures only one <style> element per component class is ever present
 * in the document <head>, using reference counting to safely remove
 * styles only when all instances of that class have been unmounted.
 */
export class StyleMountManager {
  /**
   * Maps a component class style identifier to its metadata.
   * @type {Map<string, { element: Element, refCount: number }>}
   * @private
   */
  #registry = new Map();

  /**
   * Mounts runtime styles for a component class into the document <head>.
   * If the styles for this class are already mounted, increments the
   * reference count without creating a duplicate <style> element.
   * @param {typeof AvenxComponent} componentClass - The component class (constructor).
   */
  mount(componentClass) {
    const styles = componentClass.styles;
    if (!styles || typeof styles !== 'string' || !styles.trim()) return;

    const styleId = this.#getStyleId(componentClass);

    if (this.#registry.has(styleId)) {
      this.#registry.get(styleId).refCount++;
      return;
    }

    // Check if a style element with this ID already exists in the DOM
    // (e.g. from a previous app lifecycle or SSR hydration)
    if (typeof document !== 'undefined' && document.head) {
      const existing = document.head.querySelector(`[data-avenx-style="${styleId}"]`);
      if (existing) {
        this.#registry.set(styleId, { element: existing, refCount: 1 });
        return;
      }
    }

    // Create and append a new <style> element
    if (typeof document !== 'undefined' && document.head) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-avenx-style', styleId);
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
      this.#registry.set(styleId, { element: styleEl, refCount: 1 });
    }
  }

  /**
   * Decrements the reference count for a component class's styles.
   * Removes the <style> element from the DOM only when no more
   * instances of that class are active.
   * @param {typeof AvenxComponent} componentClass - The component class (constructor).
   */
  unmount(componentClass) {
    const styles = componentClass.styles;
    if (!styles || typeof styles !== 'string' || !styles.trim()) return;

    const styleId = this.#getStyleId(componentClass);
    const entry = this.#registry.get(styleId);
    if (!entry) return;

    entry.refCount--;

    if (entry.refCount <= 0) {
      if (entry.element && entry.element.parentNode) {
        entry.element.parentNode.removeChild(entry.element);
      }
      this.#registry.delete(styleId);
    }
  }

  /**
   * Generates a unique style identifier for a component class.
   * Uses the class name as the key.
   * @param {typeof AvenxComponent} componentClass - The component class.
   * @returns {string} The style identifier.
   * @private
   */
  #getStyleId(componentClass) {
    return `avenx-style-${componentClass.name}`;
  }

  /**
   * Returns the current reference count for a component class's styles.
   * Useful for testing purposes.
   * @param {typeof AvenxComponent} componentClass - The component class.
   * @returns {number} The reference count, or 0 if not mounted.
   */
  getRefCount(componentClass) {
    const styleId = this.#getStyleId(componentClass);
    const entry = this.#registry.get(styleId);
    return entry ? entry.refCount : 0;
  }
}

/**
 * The singleton instance used by all components.
 * @type {StyleMountManager}
 */
export const styleMountManager = new StyleMountManager();
